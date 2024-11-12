// dotenv
import fs from 'fs'
import crypto from 'crypto'
import * as readLine from 'readline'

import encryptPassword from './encrypt_input'
import decryptPassword from './decrypt_input'

export function generateKeyAndIV() {
  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)

  console.log('key:', key.toString('hex'))
  console.log('iv:', iv.toString('hex'))

  // Write to .env.example
  // const envPath = '.env'
  // const previousContent = fs.readFileSync(envPath, 'utf8')
  const previousContent = '\n# Encryption key and IV\n'
  const newEnv = previousContent + `\nDATA_VALIDATION_ENCRYPTION_KEY=${key.toString('hex')}\nDATA_VALIDATION_ENCRYPTION_IV=${iv.toString('hex')}\n`
  fs.writeFileSync('.env', newEnv)

  console.log('Key and IV written to .env')
}


if (process.argv[2] === 'generate-key') {
  generateKeyAndIV()
  process.exit(0)
}

function keyCheck() {
  const keyInput = process.env.DATA_VALIDATION_ENCRYPTION_KEY
  const ivInput = process.env.DATA_VALIDATION_ENCRYPTION_IV

  if (keyInput === undefined || ivInput === undefined) {
    console.error('Please provide a KEY and IV in the .env file')
    console.error('or run the command:\n$\tnpm run cli generate-key')
    process.exit(1)
  }
}

export interface ReadlineInterface extends readLine.Interface {
  stdoutMuted?: boolean;
  _writeToOutput?: Function
  output?: NodeJS.WritableStream
}

// Command line interface
(function() {
  let currentCommand = 'main_menu'

  // Receive input from the user
  const rl: ReadlineInterface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Select a function: ',
  })

  function resetPrompt() {
    currentCommand = 'main_menu'
    rl.close()
    // rl.setPrompt('Select a function: ')
    // rl.prompt()
  }

  type Commands = {
    [key: string]: { name: string, function: Function }
  }

  const commands: Commands = {
    1: {
      name: 'Encrypt Password',
      function: () => encryptPassword(rl, resetPrompt),
    },
    2: {
      name: 'Decrypt Input',
      function: () => decryptPassword(rl, resetPrompt),
    },
  }

  function listAvailbleFunctions() {
    console.log('Available functions:')
    // console.log('[1] encryptPassword')
    Object.keys(commands).forEach((key) => {
      console.log(`[${key}] ${commands[key].name}`)
    })

    console.log('----------------------------------')
    console.log('Type the number of the function you want to use')
    console.log()

    rl.resume()
    rl.prompt()

    rl.on('line', (line: string) => {

      const command = commands[line]

      if (currentCommand !== 'main_menu') {
        return
      }

      // console.log('In main menu')

      if (command) {
        currentCommand = line
        console.log()
        command.function()
      } else {
        console.log('Invalid command')
        rl.prompt()
      }
    }).on('close', () => {
      console.log('Have a great day!')
      process.exit
    })
  }

  keyCheck()
  listAvailbleFunctions()
})()