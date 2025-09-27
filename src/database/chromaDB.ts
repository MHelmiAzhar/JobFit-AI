import dotenv from 'dotenv'
import { CloudClient } from 'chromadb'
import config from '../config'

dotenv.config()

const chromaClient = new CloudClient({
  apiKey: config.chromadb.apiKey || '',
  tenant: config.chromadb.tenant || '',
  database: config.chromadb.database || ''
})
export default chromaClient
