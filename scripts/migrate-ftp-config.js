const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const CryptoJS = require('crypto-js')

const prisma = new PrismaClient()

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
const ALGORITHM = 'aes-256-cbc'

// Old CryptoJS decrypt function
function decryptOld(encryptedText) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    return ''
  }
}

// New Node.js crypto encrypt function
function encryptNew(text) {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

async function migrateConfig() {
  try {
    console.log('🔄 Starting FTP configuration migration...')
    
    // Get existing config
    const config = await prisma.deploymentConfig.findFirst({
      where: { id: 'default' }
    })

    if (!config) {
      console.log('❌ No configuration found to migrate')
      return
    }

    console.log('📋 Current config:')
    console.log(`   Host: ${config.host}`)
    console.log(`   Port: ${config.port}`)
    console.log(`   Username: ${config.username}`)
    console.log(`   Password: ${config.password.substring(0, 20)}...`)
    
    // Decrypt the password using the old method
    const decryptedPassword = decryptOld(config.password)
    
    if (!decryptedPassword) {
      console.log('❌ Failed to decrypt existing password')
      return
    }

    console.log(`✅ Successfully decrypted password: ${decryptedPassword}`)

    // Re-encrypt with new method
    const newEncryptedPassword = encryptNew(decryptedPassword)
    
    // Update port if it's 25 (SMTP) to 21 (FTP)
    const newPort = config.port === 25 ? 21 : config.port
    
    console.log('🔧 Applying updates...')
    if (config.port !== newPort) {
      console.log(`   Port: ${config.port} → ${newPort}`)
    }
    console.log(`   Password: Re-encrypted with new format`)
    
    // Update the config
    await prisma.deploymentConfig.update({
      where: { id: 'default' },
      data: {
        password: newEncryptedPassword,
        port: newPort,
        updatedAt: new Date()
      }
    })

    console.log('✅ Configuration migrated successfully!')
    console.log('📋 Updated config:')
    console.log(`   Host: ${config.host}`)
    console.log(`   Port: ${newPort}`)
    console.log(`   Username: ${config.username}`)
    console.log(`   Password: ${newEncryptedPassword.substring(0, 20)}...`)
    
  } catch (error) {
    console.error('❌ Error migrating deployment config:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateConfig()