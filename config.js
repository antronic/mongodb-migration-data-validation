const config = {
  debug: 'full',
  target: {
    hostname: 'localhost:29001',
    username: 'observer',
    encryptedPassword: 'c425c6bec211d2e0c9d37185a4c22ede'
  },
  listMode: 'include',
  databases: [
    {
      name: 'jirac',
      isExclude: false,
      listMode: 'exclude',
      collections: [],
      collectionDefinition: [
        {
          name: 'transactions_1',
          options: {
            maximumDocumentsPerRound: 100,
            hasTTL: true,
            timeField: 'created_at',
            expireAfterSeconds: 60 * 60 * 24 * 30,
            indexName: 'created_at_1',
          },
        },
      ],
    },
    {
      name: 'test',
      isExclude: false,
      listMode: 'exclude',
      collections: [],
      collectionDefinition: [],
    },
  ]
}

module.exports = config;
// module.exports.default = config;