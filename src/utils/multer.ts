import path from 'path'
import fs from 'fs'
import multer from 'multer'
import config from '../config'
import { v4 as uuidv4 } from 'uuid'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.upload.uploadPath
    // Check if the directory exists
    if (!fs.existsSync(uploadPath)) {
      // If not, create it
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'cv') {
      const uniqueName = `cv-${uuidv4()}-${file.originalname}`
      cb(null, uniqueName)
    } else if (file.fieldname === 'project') {
      const uniqueName = `project-${uuidv4()}-${file.originalname}`
      cb(null, uniqueName)
    }
  }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['.pdf', '.docx', '.doc', '.txt']
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'
      ),
      false
    )
  }
}

export const uploadMulter = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
})
