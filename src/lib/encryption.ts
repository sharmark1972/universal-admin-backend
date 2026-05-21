import crypto from 'crypto'
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-12345'
const ALGORITHM = 'aes-256-cbc'

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  try {
    // Check if it's the old CryptoJS format (base64 without colon)
    if (!encryptedText.includes(':') && encryptedText.length > 20) {
      // Try to decrypt using CryptoJS format for backward compatibility
      // CryptoJS is imported at the top of the file
      const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-12345'
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        if (decrypted) {
          return decrypted
        }
      } catch {
        // Fall through to new format
      }
    }
    
    // New format with colon separator
    const textParts = encryptedText.split(':')
    if (textParts.length < 2) {
      // If not encrypted format, return as is (for backward compatibility)
      return encryptedText
    }
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedData = textParts.join(':')
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    // If decryption fails, return original text (for backward compatibility)
    return encryptedText
  }
}