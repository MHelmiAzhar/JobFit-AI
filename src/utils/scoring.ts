// Scoring utilities for evaluation

export interface CVScores {
  technicalSkills: number
  experience: number
  achievements: number
  culturalFit: number
}

export interface ProjectScores {
  correctness: number
  codeQuality: number
  resilience: number
  documentation: number
  creativity: number
}

export function calculateCVMatchRate(scores: CVScores): number {
  const weights = {
    technicalSkills: 0.4,
    experience: 0.25,
    achievements: 0.2,
    culturalFit: 0.15
  }

  const weightedScore =
    scores.technicalSkills * weights.technicalSkills +
    scores.experience * weights.experience +
    scores.achievements * weights.achievements +
    scores.culturalFit * weights.culturalFit

  // Convert from 1-5 scale to percentage (0-100%)
  return Math.floor(Math.min(Math.max((weightedScore / 5) * 100, 0), 100))
}

export function calculateProjectScore(scores: ProjectScores): number {
  const weights = {
    correctness: 0.3,
    codeQuality: 0.25,
    resilience: 0.2,
    documentation: 0.15,
    creativity: 0.1
  }

  const weightedScore =
    scores.correctness * weights.correctness +
    scores.codeQuality * weights.codeQuality +
    scores.resilience * weights.resilience +
    scores.documentation * weights.documentation +
    scores.creativity * weights.creativity

  // Keep score in 1-5 scale
  return Math.min(Math.max(Number(weightedScore.toFixed(2)), 1), 5)
}
