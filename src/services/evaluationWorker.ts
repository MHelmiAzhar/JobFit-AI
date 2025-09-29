import { Worker } from 'bullmq'
import { redisConnection } from '../utils/redis'
import * as evaluationService from './evaluationService'
import prisma from '../utils/prisma'
import { EvaluationStatus } from '@prisma/client'

const worker = new Worker(
  'evaluation',
  async (job) => {
    const { evaluationId } = job.data
    try {
      await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: EvaluationStatus.PROCESSING,
          attempts_made: { increment: 1 }
        }
      })

      // This function will be created in the next step
      const result = await evaluationService.processEvaluationInService(
        evaluationId
      )

      await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: 'COMPLETED',
          result: JSON.stringify(result),
          error_message: null
        }
      })
    } catch (error: any) {
      await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: 'FAILED',
          error_message: error.message,
          result: null
        }
      })
      throw error
    }
  },
  { connection: redisConnection }
)

console.log('Worker started')

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`)
})

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`)
})
