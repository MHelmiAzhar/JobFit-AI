import { z } from 'zod'

export const getEvaluationResultSchema = z
  .object({
    evaluate_id: z.string().uuid()
  })
  .strict()

export type GetEvaluationResultSchema = z.infer<
  typeof getEvaluationResultSchema
>
