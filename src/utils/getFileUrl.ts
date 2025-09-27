import path from 'path'

export const getFileUrl = (filePath: string): string => {
  const url = path.join(process.cwd(), 'public/uploads')
  return `${url}/${filePath}`
}
