import config from '../config'

export const getFileUrl = (filePath: string): string => {
  return `${config.upload.uploadPath}/${filePath}`
}
