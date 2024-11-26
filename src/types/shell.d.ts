/// reference types="@types/mongodb" />
import type {
  AggregationCursor,
  FindAndModifyMethodShellOptions,
  RemoveShellOptions,
} from '@mongosh/shell-api'
import type {
  AggregateOptions,
  BulkWriteOptions,
  CountOptions,
  CountDocumentsOptions,
  DeleteOptions,
  DistinctOptions,
  EstimatedDocumentCountOptions,
  FindOptions,
  FindOneAndDeleteOptions,
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  UpdateOptions,
  // Indexes
  CreateIndexesOptions,
  // Collection administation
  DropCollectionOptions,
} from 'mongodb'

namespace AdminCommands {

  type ListDatabaseInformation = {
    name: string
    sizeOnDisk: number
    empty: boolean
  }
  type ListDatabasesResponse = {
    databases: ListDatabaseInformation[]

    totalSize: number
    totalSizeMb: number
    ok: number
  }

  type ListDatabases = (options: { listDatabases: 1 }) => ListDatabasesResponse

  // isMaster command

  type IsMasterResponse = {
    topologyVersion: {
      processId: ObjectId
      counter: Long
    },
    hosts: string[],
    setName: string,
    ismaster: boolean,
    secondary: boolean,
    primary: string,
    tags: Document,
    me: string,
    electionId: ObjectId,
    lastWrite: {
      lastWriteDate: Date,
      majorityOpTime: Timestamp,
      opTime: Timestamp,
    }
    ok: number,
    /*
    lastWrite: {
      opTime: { ts: Timestamp({ t: 1731402445, i: 1 }), t: Long('2') },
      lastWriteDate: ISODate('2024-11-12T09:07:25.000Z'),
      majorityOpTime: { ts: Timestamp({ t: 1731402445, i: 1 }), t: Long('2') },
      majorityWriteDate: ISODate('2024-11-12T09:07:25.000Z')
    },
    maxBsonObjectSize: 16777216,
    maxMessageSizeBytes: 48000000,
    maxWriteBatchSize: 100000,
    localTime: ISODate('2024-11-12T09:07:31.555Z'),
    logicalSessionTimeoutMinutes: 30,
    connectionId: 185260,
    minWireVersion: 0,
    maxWireVersion: 25,
    readOnly: false,
    ok: 1,
    '$clusterTime': {
      clusterTime: Timestamp({ t: 1731402445, i: 1 }),
      signature: {
        hash: Binary.createFromBase64('dlr4WIaSB1DQ9eURpl+sPH8hsnQ=', 0),
        keyId: Long('7435526886974816260')
      }
    },
    operationTime: Timestamp({ t: 1731402445, i: 1 })
    */
  }
  type IsMaster = (options: { isMaster: 1 }) => IsMasterResponse
}

type AdminCommandFunction =
AdminCommands.ListDatabases
& AdminCommands.IsMaster


interface Document {
  [key: string]: any;
}

interface IndexDocument extends Document {
  v: number;
  key: Document;
  name: string;
}

interface StatsDocument extends Document {
  ok: number,
  capped: boolean,
  wiredTiger: {
    [key: string]: string | { [key: string]: string | number }
  },
  sharded: boolean,
  size: number,
  count: number,
  numOrphanDocs: number,
  storageSize: number,
  totalIndexSize: number,
  totalSize: number,
  indexSizes: { [key: string]: number },
  avgObjSize: number,
  ns: string,
  nindexes: number,
  scaleFactor: number
}

type Collection = {
  getIndexes: () => IndexDocument[]
  stats: () => Document
  //
  aggregate(pipeline: Document[], options: AggregateOptions & {
    explain: ExplainVerbosityLike;
  }): AggregationCursor
  aggregate(pipeline: Document[], options?: AggregateOptions): AggregationCursor
  aggregate(...stages: Document[]): AggregationCursor
  bulkWrite(operations: AnyBulkWriteOperation[], options?: BulkWriteOptions): BulkWriteResult
  count(query?: {}, options?: CountOptions): number
  countDocuments(query?: Document, options?: CountDocumentsOptions): number
  deleteMany(filter: Document, options?: DeleteOptions): DeleteResult | Document
  deleteOne(filter: Document, options?: DeleteOptions): DeleteResult | Document
  distinct(field: string): Document
  distinct(field: string, query: Document): Document
  distinct(field: string, query: Document, options: DistinctOptions): Document
  estimatedDocumentCount(options?: EstimatedDocumentCountOptions): number
  find(query?: Document, projection?: Document, options?: FindOptions): Cursor
  findAndModify(options: FindAndModifyMethodShellOptions): Document | null
  findOne(query?: Document, projection?: Document, options?: FindOptions): Document | null
  renameCollection(newName: string, dropTarget?: boolean): Document
  findOneAndDelete(filter: Document, options?: FindOneAndDeleteOptions): Document | null
  findOneAndReplace(filter: Document, replacement: Document, options?: FindAndModifyShellOptions<FindOneAndReplaceOptions>): Document
  findOneAndUpdate(filter: Document, update: Document | Document[], options?: FindAndModifyShellOptions<FindOneAndUpdateOptions>): Document
  insert(docs: Document | Document[], options?: BulkWriteOptions): InsertManyResult
  insertMany(docs: Document[], options?: BulkWriteOptions): InsertManyResult
  insertOne(doc: Document, options?: InsertOneOptions): InsertOneResult
  isCapped(): boolean
  remove(query: Document, options?: boolean | RemoveShellOptions): DeleteResult | Document
  replaceOne(filter: Document, replacement: Document, options?: ReplaceOptions): UpdateResult
  update(filter: Document, update: Document, options?: UpdateOptions & {
      multi?: boolean;
  }): UpdateResult | Document
  updateMany(filter: Document, update: Document, options?: UpdateOptions): UpdateResult | Document
  updateOne(filter: Document, update: Document, options?: UpdateOptions): UpdateResult | Document
}

type Database = {
  adminCommand: AdminCommandFunction
  getCollectionNames: () => string[]
  getCollection: (name: string) => Collection
  getSiblingDB: (name: string) => Database
}

// Mongosh API
// https://www.mongodb.com/docs/manual/reference/method/

declare global {
  const db: {
    adminCommand: AdminCommandFunction
  } & Database

  // Connect
  // Create a new connection and return the Database object. Usage: connect(URI, username [optional], password [optional])
  const connect: (uri: string, username?: string, password?: string) => Database

  const print: (message: string) => void
}