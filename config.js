const config = {
  target: {
    hostname: 'localhost:29001',
    username: 'observer',
    encryptedPassword: 'b4a726ad9fa610a121de5e34431b43f1'
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
      collectionDefination: [],
    },
  ]
}

module.exports = config;
// module.exports.default = config;