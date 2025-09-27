import express from 'express'
import { uploadMulter } from '../utils/multer'
import * as uploadController from '../controllers/uploadControllers'
import multer from 'multer'

const router = express.Router()

// Multer error handler middleware
const handleMulterError = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: 'File size exceeds the maximum limit of 10MB',
          code: error.code
        })

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: 'Maximum 1 file allowed per field (cv and project)',
          code: error.code
        })

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected field',
          message: `Unexpected field '${error.field}'. Expected fields: 'cv' and 'project'`,
          code: error.code,
          expectedFields: ['cv', 'project'],
          receivedField: error.field
        })

      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          error: 'Too many parts',
          message: 'Too many form parts',
          code: error.code
        })

      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message || 'Unknown upload error',
          code: error.code
        })
    }
  }

  // Handle other errors (file type, etc.)
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
      allowedTypes: ['PDF', 'DOCX', 'DOC', 'TXT']
    })
  }

  next(error)
}

// POST /upload - Upload CV and Project Report
router.post(
  '/upload',
  uploadMulter.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'project', maxCount: 1 }
  ]),
  handleMulterError,
  uploadController.uploadFile
)

export default router
