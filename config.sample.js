const config = {
  debug: 'full',
  target: {
    hostname: 'secondary_node:27017',
    username: 'observer',
    encryptedPassword: '<genereated_encrypted_password>'
  },
  listMode: 'include',
  databases: [
    {
      name: 'jirac',
      isExclude: false,
      listMode: 'include',
      collections: ['myTTLCollection'],
      collectionDefinition: [
        {
          name: 'myTTLCollection',
          options: {
            maximumDocumentsPerRound: 100,
            hasTTL: true,
            timeField: 'created_at',
            expireAfterSeconds: 60 * 60 * 24 * 30,
            indexName: 'created_at_1',
            custom: {
              validationAggregation: [
                {
                  $match: {
                    merchantID: {
                      $nin: ['xxxxxxxxxxxx', 'yyyyyyyyyyyy'],
                    },
                  },
                },
              ],
            },
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