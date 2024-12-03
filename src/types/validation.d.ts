export namespace Validation {
  type ListMode = 'include' | 'exclude'

  type CollectionOptions = {
    /**
     * Index field for validation query
     *
     * Validation query needs to have an index to optimize the query
     */
    indexName?: string

    /**
     * If the collection has TTL index
     */
    hasTTL?: boolean

    /**
     * Maximum number of documents to validate in one round in the collection
     *
     * Default: 1000
     */
    maximumDocumentsPerRound?: number
  } & (
    {
      hasTTL: true,
      timeField: string,
      expireAfterSeconds: number,
      indexName: string
      maximumDocumentsPerRound?: number
      disabledHashedMatch?: boolean
    } | {
      hasTTL?: false,
      maximumDocumentsPerRound?: number
    }
  )


  type Collection = {
    name: string
    options: CollectionOptions
  }
  type Database = {
    /**
     * Name of the database
     */
    name: string
    /**
     * Exclude the database from validation
     */
    isExclude?: boolean
    /**
     * List mode for collections
     */
    listMode: ListMode
    /**
     * List of collections to include or exclude
     * Leave empty to include all collections
     */
    collections: string[]

    /**
     * List of definition collections
     *
     * Explain the collections name, options: hasTTL, timeField
     */
    collectionDefinition: Collection[]
  }
  type Connection = {
    /**
     * Hostname of one of the target replica set member
     */
    hostname: string
    username: string
    /**
     * Encrypted password
     *
     * which encrypted by the encryption tool in ./dist/tools/index.js
     */
    encryptedPassword: string
  }
  // =========================
  // ValidationReport
  type CollectionReport = {
    collectionName: string
    isValid: boolean
    totalTime: number
    stats: {
      source: {
        count: number
        hash: string
      }
      target: {
        count: number
        hash: string
      }
    }
  }
  type DatabaseReport = {
    dbName: string
    isValid: boolean
    collections: CollectionReport[]
  }

  // =========================
  // ValidationConfig
  type ValidationConfig = {
    target: Connection,
    listMode: ListMode,
    /**
     * Define the datbases to validate
     */
    databases: Array<Database>,
  }
}

export {}