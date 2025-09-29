import { Queue } from 'bullmq'
import { redisConnection } from './redis'

export const evaluationQueue = new Queue('evaluation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: false,
    removeOnFail: 1000
  }
})
