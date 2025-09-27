import prisma from '../utils/prisma'

export const findEvaluateById = async (evaluate_id: string) => {
  return await prisma.evaluation.findFirstOrThrow({
    where: { id: evaluate_id },
    select: {
      id: true,
      status: true,
      result: true,
      error_message: true,
      attempts_made: true,
      createdAt: true,
      updatedAt: true,
      files: true
    }
  })
}
