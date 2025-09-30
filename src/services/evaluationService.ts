import * as VectorService from './vectorService'
import { parseDocument } from '../utils/fileParser'
import { calculateProjectScore, calculateCVMatchRate } from '../utils/scoring'
import * as evaluateRepositories from '../repositories/evaluateRepositories'
import { EvaluationStatus, FileType } from '@prisma/client'
import { getFileUrl } from '../utils/getFileUrl'
import geminiClient from '../utils/gemini'
import prisma from '../utils/prisma'
import { evaluationQueue } from '../utils/evaluationQueue'
import { CreateUserUploadFileSchemaValues } from '../utils/schema/evaluateSchema'

export interface EvaluationResult {
  cv_match_rate: number
  cv_feedback: string
  project_score: number
  project_feedback: string
  overall_summary: string
}

export const uploadService = async (
  data: CreateUserUploadFileSchemaValues,
  cvFile: Express.Multer.File,
  projectFile: Express.Multer.File
) => {
  return await evaluateRepositories.uploadFileToDb(data, cvFile, projectFile)
}

const evaluateCV = async (
  cvText: string,
  jobDescriptions: string,
  scoringRubric: string
): Promise<{
  technicalSkillsMatch: number
  experienceLevel: number
  relevantAchievements: number
  culturalCollaborationFit: number
  feedback: string
}> => {
  const prompt = `
      Evaluate the CV based on the scoring rubric and the provided job description.

      **CV Text:**
      ${cvText}

      **Job Description:**
      ${jobDescriptions}

      **Scoring Rubric:**
      ${scoringRubric}

      **Task:**
      1. Score the candidate on a scale of 1-5 for each parameter based on the CV Match Evaluation rubric.
      2. Provide a concise, overall summary and justification for the scores in the 'feedback' field.
      3. Return ONLY a valid JSON object. DO NOT include any explanatory text or markdown code block wrappers (e.g., \`\`\`json).

      **Output Format (JSON):**
      {
        "technicalSkillsMatch": number,
        "experienceLevel": number,
        "relevantAchievements": number,
        "culturalCollaborationFit": number,
        "feedback": string
      }
    `

  const response = await geminiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  })

  // 1. Extract text
  const rawText = response.text

  if (!rawText) {
    throw new Error('No response text from model.')
  }

  // 2. Clean the text from Markdown blocks (```json...```)
  const cleanedText = rawText
    ?.replace(/^```json\s*/, '') // Remove opening ```json
    .replace(/\s*```$/, '') // Remove closing ```
    .trim()

  try {
    // 3. Parse the clean text into a ready-to-use JSON object
    const parsedJson = JSON.parse(cleanedText)

    return parsedJson
  } catch (error) {
    console.error(
      'Failed to parse JSON from Gemini response:',
      cleanedText,
      error
    )
    throw new Error('Invalid JSON response from model.')
  }
}

const evaluateProject = async (
  projectText: string,
  scoringRubric: string
): Promise<{
  correctness: number
  codeQuality: number
  resilience: number
  documentation: number
  creativity: number
  feedback: string
}> => {
  const prompt = `
      Evaluate the project report based on the scoring rubric.

      **Project Report:**
      ${projectText}

      **Scoring Rubric:**
      ${scoringRubric}

      **Task:**
      1. Score the project on a scale of 1-5 for each parameter based on the Project Deliverable Evaluation rubric.
      2. Provide a concise, overall summary and justification for the scores in the 'feedback' field.
      3. Return ONLY a valid JSON object. DO NOT include any explanatory text or markdown code block wrappers (e.g., \`\`\`json).

      **Output Format (JSON):**
      {
        "correctness": number,
        "codeQuality": number,
        "resilience": number,
        "documentation": number,
        "creativity": number,
        "feedback": string
      }
    `
  const response = await geminiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  })

  // 1. Extract text from the SDK response
  const rawText = response.text
  if (!rawText) {
    throw new Error('No response text from model.')
  }

  // 2. Clean the text from Markdown blocks (```json...```)
  const cleanedText = rawText
    ?.replace(/^```json\s*/, '') // Remove opening ```json
    .replace(/\s*```$/, '') // Remove closing ```
    .trim()

  try {
    // 3. Parse the clean text into a ready-to-use JSON object
    const parsedJson = JSON.parse(cleanedText)

    // Now you have the JSON object you need
    return parsedJson
  } catch (error) {
    console.error(
      'Failed to parse JSON from Gemini response:',
      cleanedText,
      error
    )
    throw new Error('Invalid JSON response from model.')
  }
}

const overallSummary = async (
  cvMatchRate: number,
  cvFeedback: string,
  projectScore: number,
  projectFeedback: string
): Promise<string> => {
  const prompt = `
      You are an HR evaluation specialist. Your task is to combine the CV evaluation results and the Project evaluation results into one concise overall summary.

      **CV Evaluation Results:**
      - Match Rate: ${cvMatchRate}%
      - Feedback: ${cvFeedback}

      **Project Evaluation Results:**
      - Score: ${projectScore}/5
      - Feedback: ${projectFeedback}

      **Task:**
      1. Analyze both evaluations.
      2. Generate an overall summary that consists of exactly **3 to 5 sentences**.
      3. The summary must clearly cover: **Strengths (Kekuatan)**, **Gaps (Kesenjangan)**, and **Recommendations (Rekomendasi)** for the candidate.
      4. **Return ONLY the text of the summary.** DO NOT include any JSON, markdown code block wrappers (e.g., \`\`\`json), or any other formatting characters.
    `

  // --- API Call Logic ---
  const response = await geminiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  })

  // 1. Extract text from the SDK response
  const rawText = response.text

  if (!rawText) {
    throw new Error('No response text from model.')
  }

  // 2. Clean the text from Markdown blocks
  const cleanedText = rawText
    // Attempt to remove any remaining JSON or markdown formatting
    ?.replace(/^```(json|text)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  // 3. Directly return the cleaned string
  return cleanedText
}

export const startEvaluation = async (evaluate_id: string) => {
  // Check evaluate_id
  const evaluation = await evaluateRepositories.findEvaluateById(evaluate_id)

  if (!evaluation) {
    throw new Error('Evaluation not found')
  }

  if (
    evaluation.status === EvaluationStatus.QUEUED ||
    evaluation.status === EvaluationStatus.PROCESSING
  ) {
    throw new Error(
      `Evaluation is already active with status: ${evaluation.status}. Please wait.`
    )
  }

  if (
    evaluation.status === EvaluationStatus.FAILED &&
    evaluation.attempts_made < 3
  ) {
    throw new Error(
      `Evaluation failed but is still being retried automatically. Please wait. Attempts: ${evaluation.attempts_made}`
    )
  }

  // Reset attempts if previously failed 3 times
  await evaluateRepositories.updateEvaluationAttempts(evaluate_id)

  await evaluationQueue.add('evaluation', { evaluationId: evaluate_id })

  return { evaluationId: evaluate_id }
}

export const getEvaluationStatus = async (evaluationId: string) => {
  const evaluation = await evaluateRepositories.findEvaluateById(evaluationId)

  if (!evaluation) {
    throw new Error('Evaluation not found')
  }

  if (evaluation.status === EvaluationStatus.PENDING) {
    return {
      status: evaluation.status,
      result: null,
      message: 'Evaluation is still pending, please evaluate first'
    }
  } else if (
    evaluation.status === EvaluationStatus.QUEUED ||
    evaluation.status === EvaluationStatus.PROCESSING
  ) {
    return {
      status: evaluation.status,
      result: null,
      message: `Evaluation is in the ${evaluation.status}, please wait`
    }
  } else if (
    evaluation.status === EvaluationStatus.FAILED &&
    evaluation.attempts_made >= 3
  ) {
    return {
      status: evaluation.status,
      result: null,
      error: 'Evaluation failed after multiple attempts. Please try again.'
    }
  } else if (evaluation.status === EvaluationStatus.FAILED) {
    return {
      status: evaluation.status,
      result: null,
      error: 'Evaluation failed, program will try to re-evaluate in a moment'
    }
  } else {
    return {
      status: evaluation.status,
      user: {
        name: evaluation.name,
        email: evaluation.email,
        phone: evaluation.phone
      },
      result: evaluation.result ? JSON.parse(evaluation.result as string) : null
    }
  }
}

export const processEvaluationInService = async (evaluationId: string) => {
  try {
    // Get CV and project paths from evaluationId
    const checkEvaluate = await evaluateRepositories.findEvaluateById(
      evaluationId
    )

    if (!checkEvaluate) {
      throw new Error('Evaluation not found')
    }

    const cvPath = getFileUrl(
      checkEvaluate.files.filter((f) => f.type === FileType.CV)[0]?.file_name ||
        ''
    )
    const projectPath = getFileUrl(
      checkEvaluate.files.filter((f) => f.type === FileType.PROJECT)[0]
        ?.file_name || ''
    )

    // Parse documents
    const cvText = await parseDocument(cvPath)
    const projectText = await parseDocument(projectPath)

    // Find job descriptions and scoring rubric from ChromaDB
    const jobDescriptions = await VectorService.getDataById('job_description')
    const scoringRubricCv = await VectorService.getDataById('scoring_rubric_cv')

    // Evaluate CV
    const cvEvaluation = await evaluateCV(
      cvText,
      jobDescriptions,
      scoringRubricCv
    )

    // Find scoring rubric for project from ChromaDB
    const scoringRubricProject = await VectorService.getDataById(
      'scoring_rubric_project'
    )
    // Evaluate Project
    const projectEvaluation = await evaluateProject(
      projectText,
      scoringRubricProject
    )

    // Calculate final cv scores based on requirements
    const cvMatchRate: number = calculateCVMatchRate({
      technicalSkills: cvEvaluation.technicalSkillsMatch,
      experience: cvEvaluation.experienceLevel,
      achievements: cvEvaluation.relevantAchievements,
      culturalFit: cvEvaluation.culturalCollaborationFit
    })

    // Calculate final project scores based on requirements
    const projectScore: number = calculateProjectScore({
      correctness: projectEvaluation.correctness,
      codeQuality: projectEvaluation.codeQuality,
      resilience: projectEvaluation.resilience,
      documentation: projectEvaluation.documentation,
      creativity: projectEvaluation.creativity
    })

    // Generate overall summary
    const summaryText = await overallSummary(
      cvMatchRate,
      cvEvaluation.feedback,
      projectScore,
      projectEvaluation.feedback
    )

    await prisma.evaluation.update({
      where: { id: evaluationId },
      data: {
        status: EvaluationStatus.COMPLETED,
        result: JSON.stringify({
          cv_match_rate: cvMatchRate,
          cv_feedback: cvEvaluation.feedback,
          project_score: projectScore,
          project_feedback: projectEvaluation.feedback,
          overall_summary: summaryText
        })
      }
    })

    return {
      cv_match_rate: cvMatchRate,
      cv_feedback: cvEvaluation.feedback,
      project_score: projectScore,
      project_feedback: projectEvaluation.feedback,
      overall_summary: summaryText
    }
  } catch (error) {
    console.error('Evaluation error:', error)
    throw new Error(
      `Evaluation failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}
