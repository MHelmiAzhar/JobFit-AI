import * as uploadRepo from '../repositories/uploadRepositories'
export const uploadService = async (
  cvFile: Express.Multer.File,
  projectFile: Express.Multer.File
) => {
  return await uploadRepo.uploadFileToDb(cvFile, projectFile)
}
