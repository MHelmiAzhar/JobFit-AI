import { Request, Response, NextFunction } from 'express'
import * as uploadService from '../services/uploadService'

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as {
      cv: Express.Multer.File[]
      project: Express.Multer.File[]
    }

    if (!files || !files.cv || !files.project) {
      return res.status(400).json({
        error: 'Both CV and project report files are required'
      })
    }
    const cvFile = files.cv[0]
    const projectFile = files.project[0]

    if (!cvFile || !projectFile) {
      return res.status(400).json({
        error: 'Both CV and project report files are required'
      })
    }

    const data = await uploadService.uploadService(cvFile, projectFile)

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data
    })
  } catch (error) {
    next(error)
  }
}
