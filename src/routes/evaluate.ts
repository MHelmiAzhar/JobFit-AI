import express from 'express'
import * as evaluateController from '../controllers/evaluateContollers'

const router = express.Router()

router.post('/', evaluateController.startEvaluation)
router.get('/:id', evaluateController.getEvaluationResult)

export default router
