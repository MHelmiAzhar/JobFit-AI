import path from 'path'
import dotenv from 'dotenv'

dotenv.config()
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  chromadb: {
    tenant: process.env.CHROMADB_TENANT,
    apiKey: process.env.CHROMADB_API_KEY,
    database: process.env.CHROMADB_DATABASE
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379'
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    uploadPath: path.join(
      process.cwd(),
      process.env.UPLOAD_PATH || 'public/uploads'
    )
  }
}

export default config
