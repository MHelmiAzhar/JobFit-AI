import { FileType } from '@prisma/client'
import prisma from '../utils/prisma'

export const uploadFileToDb = async (
  cvFile: Express.Multer.File,
  projectFile: Express.Multer.File
) => {
  // Create evaluation first
  const evaluation = await prisma.evaluation.create({
    data: {}
  })

  // Create files and relate to evaluation
  const files = await prisma.file.createMany({
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
    evaluationId: evaluation.id,
    files: createdFiles
  }
}
