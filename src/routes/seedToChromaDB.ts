import { Router } from 'express'
import { insertDocs } from '../services/vectorService'

const router = Router()

// endpoint POST /chroma/insert
router.post('/insert', async (req, res) => {
  try {
    await insertDocs()

    res.json({ status: 'success', message: 'Data inserted to Chroma' })
  } catch (err: any) {
    console.error('❌ Error inserting:', err)
    res.status(500).json({ error: 'Failed to insert data' })
  }
})

export default router
