import { Request, Response, NextFunction } from 'express'
import * as evaluationService from '../services/evaluationService'
import { getEvaluationResultSchema } from '../utils/schema/evaluateSchema'

export const startEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parse = getEvaluationResultSchema.safeParse(req.body)
    if (!parse.success) {
      const errMessage = parse.error.issues.map(
        (err) => `${err.path} - ${err.message}`
      )
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        detail: errMessage
      })
    }

    const { evaluate_id } = parse.data

    const { evaluationId } = await evaluationService.startEvaluation(
      evaluate_id
    )

    res.status(202).json({
      success: true,
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
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}
