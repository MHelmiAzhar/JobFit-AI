import dotenv from 'dotenv'
import { config } from './config'
import express from 'express'
import cors from 'cors'
import path from 'path'

// Import routes
import uploadRouter from './routes/upload'
import evaluateRouter from './routes/evaluate'
import chromaClient from './database/chromaDB'

// Initialize environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/upload', uploadRouter)
app.use('/api/evaluate', evaluateRouter)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        config.nodeEnv === 'development' ? err.message : 'Something went wrong'
    })
  }
)

const PORT = config.port

async function checkConnection() {
  try {
    const collections = await chromaClient.listCollections()
    console.log('Connected to ChromaDB!')
  } catch (error) {
    console.error('Connection failed:', error)
  }
}

checkConnection()

// Start the worker
import './services/evaluationWorker'

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

export default app
