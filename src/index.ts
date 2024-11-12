import readLine from 'readline'
import crypto from 'crypto'

// Command line interface
(function() {

  function encryptPassword(password: string) {
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    // Convert to SHA-256
    const hash = crypto.createHash('sha256')
    hash.update(password)
    return hash.digest('hex')
  }

  function listAvailbleFunctions() {
    console.log('Available functions:')
    console.log('[1] encryptPassword')

    // Receive input from the user
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout
    })


  }

  listAvailbleFunctions()
})()