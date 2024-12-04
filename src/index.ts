import dotenv from 'dotenv'
import start from './driver'


// Command line interface
(function() {
  dotenv.config({ override: true })

  const config = require('./config.js')
  start(config)
})()