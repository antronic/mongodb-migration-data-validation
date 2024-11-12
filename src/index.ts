import dotenv from 'dotenv'
dotenv.config()
// dotenv.config({ override: true })
import start from './driver'
import { Validation } from './types/validation'


// Command line interface
(function() {
  const config = require('./config.js')

  // const config: Validation.ValidationConfig = {
  //   target: {
  //     hostname: 'localhost:29001',
  //     username: 'observer',
  //     encryptedPassword: 'b4a726ad9fa610a121de5e34431b43f1'
  //   },
  //   listMode: 'include',
  //   databases: [
  //     {
  //       name: 'jirac',
  //       isExclude: false,
  //       listMode: 'exclude',
  //       collections: [],
  //       collectionDefination: [
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
  //       collectionDefination: [],
  //     },
  //   ]
  // }

  start(config)
})()