import dotenv from 'dotenv'
import crypto from 'crypto'
import type { ReadlineInterface } from '..'
dotenv.config({ override: true })


const keyInput = process.env.ENCRYPTION_KEY
const ivInput = process.env.ENCRYPTION_IV

function encryptPassword(rl: ReadlineInterface, callback: Function) {
  if (keyInput === undefined || ivInput === undefined) {
    console.error('Please provide a KEY and IV in the .env file')
    process.exit(1)
  }

  // crypto.randomBytes(32).toString('hex')
  const KEY = Buffer.from(keyInput, 'hex')
  // crypto.randomBytes(16).toString('hex')
  const IV = Buffer.from(ivInput, 'hex')


  // Encrypt the password
  function hashPassword(password: string) {
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV)
    let encryped = cipher.update(password, 'utf8', 'hex')
    encryped += cipher.final('hex')
    return encryped
  }
  // Receive input from the user

  let inputPassword = ''
  rl.stdoutMuted = true

  rl.setPrompt('Enter your password: ')

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
    inputPassword = line
    console.log()
    rl.stdoutMuted = false
    // rl.write('Return back to main menu?')

    const encryptedPassword = hashPassword(inputPassword)
    console.log()
    console.log('##################################')
    console.log('Encrypted password:')
    console.log('----------------------------------')
    console.log()
    console.log(encryptedPassword)
    console.log()
    console.log('##################################')
    console.log()
    callback()
  })
}

export default encryptPassword