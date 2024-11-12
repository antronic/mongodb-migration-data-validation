/// <reference path="../types/shell.d.ts" />

import { Database } from '../types/shell'

const loadData = (_db: Database) => {
  const targetDb = connect('mongodb://observer:123321@localhost:27091?tls=true&tlsAllowInvalidHostnames=true&directConnection=true')

  const dbs = _db.adminCommand({ listDatabases: 1 })

  const databases = []

  console.log(dbs)
}

export default loadData