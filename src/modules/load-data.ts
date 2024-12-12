/// <reference path="../types/shell.d.ts" />

import dayjs from 'dayjs'
import { AdminCommands, Collection, Database } from '../types/shell'
import { Validation } from '../types/validation'

/**
 * Get all databases exlcude admin, local, config, and defined in the exclude list
 *
 * @param _db
 */
export const getDatabases = (_db: Database) => {
  const excludeList = ['admin', 'local', 'config']
  const dbs = _db.adminCommand({ listDatabases: 1 })

  const databases: string[] = []

  dbs.databases.forEach((db) => {
    if (!excludeList.includes(db.name)) {
      databases.push(db.name)
    }
  })

  return databases
}

/**
 * Get all collection names from the database
 *
 * @param _db
 * @param dbName
 * @returns
 */
export const getCollections = (_db: Database, dbName: string) => {
  const db = _db.getSiblingDB(dbName)
  const collections = db.getCollectionNames()

  return collections
}

/**
 * TODO: Get all indexes from the collection
 */


/**
 * TODO: Get all stats from the collection
 */

/**
 * Get all documents from the collection from the specified range of time
 *
 * @param collection Collection
 * @param collectionOptions Collection options
 * @param round Round number
 * @param timeField Time field
 * @param start Start time
 * @param end End time
 */
export const getDocuments = (
  collection: Collection,
  pipeline: any[],
) => {
  const documents = collection.aggregate(pipeline).toArray()

  return documents
}

export const generateAggregatePipeline = (
  collectionOptions?: Validation.CollectionOptions,
  timeField: string = 'created_at',
  start: Date = dayjs().toDate(),
  end: Date  = dayjs().toDate(),
) => {
  return {
    pipeline: [] as any[],
    _pipeline: [] as any[],
    round: 0,
    limit: collectionOptions && collectionOptions.maximumDocumentsPerRound || 1000,

    initalize() {
      //
      // Apply custom validation query, if has
      if (collectionOptions && collectionOptions.custom) {
        this.pipeline = [...collectionOptions.custom.validationAggregation]
      }
      //
      // If the collection has TTL index
      if (collectionOptions && collectionOptions.hasTTL && !collectionOptions.skipDefaultValidation) {
        // const startDate = start
        const expireAfterSeconds = collectionOptions &&
          collectionOptions.hasTTL &&
          collectionOptions.expireAfterSeconds || 0

        let endDate = dayjs(end)
          .subtract(10, 'minutes')
          .toDate()

        const startDate = dayjs(start)
          .subtract(expireAfterSeconds, 'second')
          .add(30, 'minutes')
          .toDate()

        const _timeField = collectionOptions && collectionOptions.timeField || timeField

        this.pipeline.push({ $match: { [_timeField]: { $gte: startDate, $lt: endDate } } })
      }


      if (!collectionOptions?.skipDefaultValidation) {
        this.pipeline.push({ $sort: { _id: 1 } })
      }
      this._pipeline = [...this.pipeline]
      return this
    },
    setRound(round: number) {
      this._pipeline = [...this.pipeline]
      this.round = round
      if (!collectionOptions?.skipDefaultValidation) {
        this._pipeline.push({ $skip: (this.round - 1) * this.limit })
      }

      // console.log()
      // console.log('round', round)
      // // console.log('pipeline')
      // // console.log(this.pipeline)
      // console.log('###########')
      // console.log('_pipeline')
      // console.log(this._pipeline)
      // console.log()

      return this
    },
    generate() {
      if (!collectionOptions?.skipDefaultValidation) {
        this._pipeline.push({ $limit: this.limit })
      }

      return this._pipeline
    },
  }
}

//
// =====================================================================================================================
// =====================================================================================================================
// =====================================================================================================================
//
/**
 * This script will load() in mongosh of the source data
 *
 * So don't need to authenticate, just query directly
 */
export const _loadSourceData = () => {
  const thisDb = db
  const dbs = getDatabases(db)
  // console.log(dbs)

  for (const dbName of dbs) {
    const collections = getCollections(thisDb, dbName)
    // console.log(collections)
    for (const collection of collections) {
      const col = thisDb.getSiblingDB(dbName).getCollection(collection)
      console.log(`${dbName}.${collection}`)
      // const documents = getDocuments(col, new Date('2021-01-01'), new Date('2026-01-02'))
      // console.log(documents.toArray())
    }
  }
}

/**
 * Get all databases from the target database
 *
 * @param _db
 */
export const _loadTargetData = (_db: Database) => {
  const dbs = getDatabases(_db)

  for (const dbName of dbs) {
    const collections = getCollections(_db, dbName)
    // console.log(collections)
    for (const collection of collections) {
      const col = _db.getSiblingDB(dbName).getCollection(collection)
      console.log(`$db.${dbName}.${collection}`)
      // const documents = getDocuments(col, new Date('2021-01-01'), new Date('2026-01-02'))
      // console.log(documents)
    }
  }
}