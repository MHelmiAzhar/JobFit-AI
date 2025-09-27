import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

const geminiClient = new GoogleGenAI({})
export default geminiClient
