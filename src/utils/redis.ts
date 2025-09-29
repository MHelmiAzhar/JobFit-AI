import { ConnectionOptions } from 'bullmq'
import Redis from 'ioredis'
import config from '../config'

const redisConfig: ConnectionOptions = {
  host: config.redis.host,
  port: parseInt(config.redis.port),
  maxRetriesPerRequest: 2
}

const redisConnection = new Redis(redisConfig)

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis')
})

redisConnection.on('error', (err) => {
  console.error('❌ Could not connect to Redis:', err)
})

export { redisConnection }
