import dotenv from 'dotenv'
// dotenv.config({ override: true })
import start from './driver'
import { Validation } from './types/validation'


// Command line interface
(function() {
  dotenv.config({ override: true })

  // console.log('test')
  const config = require('./config.js')
  // console.log('config')
  // console.log(config)

  // const config: Validation.ValidationConfig = {
  //   target: {
  //     hostname: 'localhost:29001',
  //     username: 'observer',
  //     encryptedPassword: 'c425c6bec211d2e0c9d37185a4asdc22edes'
  //   },
  //   listMode: 'include',
  //   databases: [
  //     {
  //       name: 'jirac',
  //       isExclude: false,
  //       listMode: 'exclude',
  //       collections: [],
  //       collectionDefinition: [
  //         {
  //           name: 'transactions_1',
  //           options: {
  //             maximumDocumentsPerRound: 100,
  //             hasTTL: true,
  //             timeField: 'created_at',
  //             expireAfterSeconds: 60 * 60 * 24 * 30,
  //             indexName: 'created_at_1',
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       name: 'test',
  //       isExclude: false,
  //       listMode: 'exclude',
  //       collections: [],
  //       collectionDefinition: [],
  //     },
  //   ]
  // }

  start(config)
})()