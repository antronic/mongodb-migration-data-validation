# Data Types

## Validation Configurations
The validation configurations are stored in the `config.js` file.

The configurations are used to configuration the target database (MongoDB Atlas) and the determine the databases and collections to validate between the source and target databases.

Including determining the collection detail such as the `TTL Index` and others

| Key | Type | Description | Required | Default |
| --- | -----| ----------- | -------- | ------- |
| target | Object | The target database connection string | Yes | N/A |
| target.hostname | String | The target database hostname | Yes | N/A |
| target.username | String | The target database username | Yes | N/A |
| target.encrypedPassword | String | The target database encrypted password that you need to you the provided [encrpytion tool](/README.md#generate-the-encryption_key-and-encryption_iv) | Yes | N/A |
| listMode | String | The list mode to determine the databases to `include` or `exclude` | No | include |
| databases | Array of [Database](#database) | The list of databases to validate | Yes | N/A |


## Database
| Key | Type | Description | Required | Default |
| --- | -----| ----------- | -------- | ------- |
| name | String | The database name | Yes | N/A |
| isExcluded | Boolean | The flag to determine if the database is excluded | No | false |
| listMode | String | The list mode to determine the collections to `include` or `exclude` | No | include |
| collections | Array of string | The list of collection names to validate | Yes | N/A |
| collectionDefinition | Array of [Collection Definition](#collection-defination) | The list of collection defination and configuration to validate | Yes | N/A |

## Collection Definition
| Key | Type | Description | Required | Default |
| --- | -----| ----------- | -------- | ------- |
| name | String | The collection name | Yes | N/A |
| options | Object | The [collection options](#collection-options) | Yes | N/A |

### Collection Options
| Key | Type | Description | Required | Default |
| --- | -----| ----------- | -------- | ------- |
| maximumDocumentsPerRound | Number | The maximum number of documents to validate per round | No | 1000 |
| hasTTL | Boolean | The flag to determine if the collection has TTL index | No | false |

** If `hasTTL` is `true`, you need to provide the addtionl configuration fields:
| Key | Type | Description | Required | Default |
| --- | -----| ----------- | -------- | ------- |
| timeField | String | The field name that contains the TTL index | Yes | N/A |
| expireAfterSeconds | Number | The number of seconds to expire the document | Yes | N/A |
| indexName | String | The TTL index name | Yes | N/A |


<!-- End -->
[X]: # (end-docs)
[X]: # (end-data-types)