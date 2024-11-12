// dotenv
import * as readLine from 'readline'
import encryptPassword from './encrypt_input'
import decryptPassword from './decrypt_input'

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

  listAvailbleFunctions()
})()