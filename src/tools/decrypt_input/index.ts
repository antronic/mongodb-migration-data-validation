import dotenv from 'dotenv'
import crypto from 'crypto'
import { type ReadlineInterface } from '..'
dotenv.config()

const keyInput = process.env.ENCRYPTION_KEY
const ivInput = process.env.ENCRYPTION_IV

export const decryptContent = (content: string) => {
  if (keyInput === undefined || ivInput === undefined) {
    console.error('Please provide a KEY and IV in the .env file')
    console.error('or run the command:\n$\tnpm run cli generate-key')
    process.exit(1)
  }

  // crypto.randomBytes(32).toString('hex')
  const KEY = Buffer.from(keyInput!, 'hex')
  // crypto.randomBytes(16).toString('hex')
  const IV = Buffer.from(ivInput!, 'hex')

  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV)
  let decrypted = decipher.update(content, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

function decryptPassword(rl: ReadlineInterface, callback: Function) {
  // Receive input from the user
  rl.stdoutMuted = false

  rl.setPrompt('Enter your encrypted string: ')
  rl.prompt()

  rl._writeToOutput = function _writeToOutput(stringToWrite: string) {
      if (rl.stdoutMuted) {
          rl.output?.write('')
      } else {
          rl.output?.write(stringToWrite)
      }
  }

  console.log()
  // Receive the password from the user
  rl.on('line', (line) => {
    // inputPassword = line
    console.log()
    rl.stdoutMuted = false
    // rl.write('Return back to main menu?')

    // Decrypt the password
    const decryptedPassword = decryptContent(line)


    console.log()
    console.log('##################################')
    console.log('Decrypted password:')
    console.log('----------------------------------')
    console.log()
    console.log(decryptedPassword)
    console.log()
    console.log('##################################')
    console.log()
    callback()
  })
}

export default decryptPassword