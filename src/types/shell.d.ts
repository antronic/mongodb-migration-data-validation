/// reference types="@types/mongodb" />
import type { } from '@mongosh/shell-api'

namespace AdminCommands {

  type ListDatabasesResponse = {
    databases: {
      name: string
      sizeOnDisk: number
      empty: boolean
    }[]

    totalSize: number
    totalSizeMb: number
    ok: number
  }

  type ListDatabases = (options: { listDatabases: 1 }) => ListDatabasesResponse
}

type AdminCommandFunction =
| AdminCommands.ListDatabases


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