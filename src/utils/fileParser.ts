import fs from 'fs/promises'
import path from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function parseDocument(filePath: string): Promise<string> {
  try {
    const fileExtension = path.extname(filePath).toLowerCase()

    switch (fileExtension) {
      case '.pdf':
        return await parsePDF(filePath)

      case '.docx':
      case '.doc':
        return await parseDocx(filePath)

      case '.txt':
        return await parseTxt(filePath)

      default:
        throw new Error(`Unsupported file format: ${fileExtension}`)
    }
  } catch (error) {
    console.error(`Failed to parse document ${filePath}:`, error)
    throw new Error(
      `Document parsing failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

async function parsePDF(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath)
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    throw new Error(
      `PDF parsing failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

async function parseDocx(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath)
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  } catch (error) {
    throw new Error(
      `DOCX parsing failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

async function parseTxt(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    throw new Error(
      `TXT parsing failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

// Utility function to clean and normalize text
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim()
}

// Utility function to extract sections from text (if needed)
export function extractSections(text: string): { [key: string]: string } {
  const sections: { [key: string]: string } = {}

  // Common CV sections patterns
  const patterns = {
    skills:
      /(?:skills?|technical\s+skills?|competenc(?:ies|y))[:\s]*(.*?)(?:\n\s*\n|\n\s*[A-Z]|$)/is,
    experience:
      /(?:experience|work\s+experience|employment)[:\s]*(.*?)(?:\n\s*\n|\n\s*[A-Z]|$)/is,
    education:
      /(?:education|academic\s+background)[:\s]*(.*?)(?:\n\s*\n|\n\s*[A-Z]|$)/is,
    projects: /(?:projects?|portfolio)[:\s]*(.*?)(?:\n\s*\n|\n\s*[A-Z]|$)/is
  }

  for (const [section, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      sections[section] = cleanText(match[1])
    }
  }

  return sections
}
