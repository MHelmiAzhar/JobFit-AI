import { FileType } from '@prisma/client'
import { CreateUserUploadFileSchemaValues } from '../utils/schema/evaluateSchema'
import prisma from '../utils/prisma'

export const findEvaluateById = async (evaluate_id: string) => {
  return await prisma.evaluation.findFirst({
    where: { id: evaluate_id },
    select: {
      id: true,
      status: true,
      result: true,
      name: true,
      email: true,
      phone: true,
      error_message: true,
      attempts_made: true,
      createdAt: true,
      updatedAt: true,
      files: true
    }
  })
}
export const updateEvaluationAttempts = async (evaluate_id: string) => {
  return await prisma.evaluation.update({
    where: { id: evaluate_id },
    data: {
      attempts_made: {
        increment: 1
      }
    }
  })
}

export const uploadFileToDb = async (
  data: CreateUserUploadFileSchemaValues,
  cvFile: Express.Multer.File,
  projectFile: Express.Multer.File
) => {
  // Create evaluation first
  const evaluation = await prisma.evaluation.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone
    },
    select: { id: true, status: true, name: true, email: true, phone: true }
  })

  // Create files and relate to evaluation
  await prisma.file.createMany({
    data: [
      {
        file_name: cvFile.filename,
        original_name: cvFile.originalname,
        file_size: cvFile.size,
        type: FileType.CV,
        evaluation_id: evaluation.id
      },
      {
        file_name: projectFile.filename,
        original_name: projectFile.originalname,
        file_size: projectFile.size,
        type: FileType.PROJECT,
        evaluation_id: evaluation.id
      }
    ]
  })

  // Get created files
  const createdFiles = await prisma.file.findMany({
    where: { evaluation_id: evaluation.id }
  })

  return {
    evaluationId: evaluation,
    files: createdFiles
  }
}
