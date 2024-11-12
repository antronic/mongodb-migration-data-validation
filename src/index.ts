import start from './driver'
import { connectTarget } from './modules/connect'
import { Validation } from './types/validation'
// import { loadSourceData, loadTargetData } from './modules/load-data'

// Command line interface
(function() {
  const config: Validation.ValidationConfig = {
    target: {
      hostname: 'localhost:29001',
      username: 'observer',
      encryptedPassword: '42f6fdcd56a9f2c3de49bdf97b1eb9cc'
    },
    listMode: 'include',
    databases: [
      {
        name: 'jirac',
        isExclude: false,
        listMode: 'exclude',
        collections: [],
        collectionDefination: [
          {
            name: 'transactions_1',
            options: {
              maximumDocumentsPerRound: 100,
              // hasTTL: true,
              // timeField: 'created_at',
              // expireAfterSeconds: 60 * 60 * 24 * 30,
              // indexName: 'created_at_1',
            },
          },
        ],
      },
      {
        name: 'test',
        isExclude: false,
        listMode: 'exclude',
        collections: [],
        collectionDefination: [],
      },
    ]
  }

  start(config)
})()