import e from 'express'
import { z } from 'zod'

export const getEvaluationResultSchema = z
  .object({
    evaluate_id: z.string().uuid()
  })
  .strict()

export const createUserUploadFileSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must be at most 15 digits')
  })
  .strict()

export type GetEvaluationResultSchema = z.infer<
  typeof getEvaluationResultSchema
>
export type CreateUserUploadFileSchemaValues = z.infer<
  typeof createUserUploadFileSchema
>
