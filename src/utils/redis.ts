import { ConnectionOptions } from 'bullmq'
import Redis from 'ioredis'
import config from '../config'

const redisConfig: ConnectionOptions = {
  host: config.redis.host,
  port: parseInt(config.redis.port),
  // Opsi ini penting agar ioredis tidak mencoba terus menerus jika koneksi pertama gagal
  // dan membiarkan BullMQ yang mengatur logika retry.
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
