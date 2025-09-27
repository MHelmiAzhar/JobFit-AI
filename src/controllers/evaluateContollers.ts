import { Request, Response, NextFunction } from 'express'
import * as evaluationService from '../services/evaluationService'

export const startEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { evaluate_id } = req.body

    if (!evaluate_id) {
      return res.status(400).json({
        error: 'evaluate_id is required'
      })
    }

    const { evaluationId } = await evaluationService.startEvaluation(
      evaluate_id
    )

    res.status(202).json({
      message: 'Evaluation has been queued.',
      evaluationId
    })
  } catch (error) {
    next(error)
  }
}

export const getEvaluationResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Evaluation ID is required' })
    }
    const result = await evaluationService.getEvaluationStatus(id)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
