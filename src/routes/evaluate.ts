import express from 'express'
import * as evaluateController from '../controllers/evaluateContollers'
import { uploadMulter } from '../utils/multer'
import { handleMulterError } from '../exception/ErrorMulterHandler'

const router = express.Router()

router.post(
  '/upload-cv-user',
  uploadMulter.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'project', maxCount: 1 }
  ]),
  handleMulterError,
  evaluateController.createUserUploadFile
)
router.post('/', evaluateController.startEvaluation)
router.get('/:id', evaluateController.getEvaluationResult)

export default router
