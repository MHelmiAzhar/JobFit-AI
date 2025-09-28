import { insertDocs } from '../services/vectorService'

const seed = async () => {
  try {
    console.log('Seeding to ChromaDB...')
    await insertDocs()
    console.log('Seeding successful.')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding to ChromaDB:', error)
    process.exit(1)
  }
}

seed()
