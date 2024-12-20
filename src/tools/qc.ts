import dotenv from 'dotenv'
import { Validation } from '../types/validation'
import { generateAggregatePipeline, getCollections, getDatabases, getDocuments } from '../modules/load-data'
import { connectTarget } from '../modules/connect'
import dayjs from 'dayjs'
import { hashBigObject } from './hash'
import fs from 'fs'

/**
 * This script built for do the Quickly Check (QC) of the data
 * Primary focus on debugging and testing purpose
 *
 * It imitates the similar process of the driver.js script
 * but this intended to run just only single round
 */

// function encrypedData(data: any) {
//   const crypto = require('crypto')
//   const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

//   const key: Buffer<ArrayBuffer> = ''

//   let encrypted = cipher.update(data, 'utf8', 'hex')
//   encrypted += cipher.final('hex')
//   return encrypted
// }

// Command line interface
(function() {
  dotenv.config({ override: true })

  const config: Validation.QCValidationConfig = require('./config.qc.js')
  //
  //
  //
  //
  function createReportFile(fileName: string, data: any) {
    // Create report folder if not exists
    if (!fs.existsSync('./.reports')) {
      fs.mkdirSync('./.reports')
    }

    const _data = JSON.stringify(data, null, 2)

    // Create report file
    fs.writeFileSync(`./.reports/${fileName}.json`, _data)

    console.log(`\n\t*** Report file created: ./.reports/${fileName}.json ***`)
  }
  //
  //
  //
  const reports: Map<string, Validation.DatabaseReport> = new Map()
  // ====================================
  //
  console.log('** QC always enabled Debug mode')
  config.debug = 'full'

  const excludedDatabases = config.databases
    .filter(db => db.isExclude || config.listMode === 'exclude')
    .map(db => db.name)

  const includedDatabases = config.listMode === 'include' ? config.databases
    .filter(db => !db.isExclude)
    .map(db => db.name) : []
  // --------------------------------
  //
  // --------------------------------
  const start = (config: Validation.QCValidationConfig) => {
    const isDebug = ['full', 'info'].includes(config.debug!)
    const debugMode = config.debug

    if (isDebug) {
      console.log('** Debug mode enabled')
    } else {
      console.log('-- Debug mode disabled')
    }

    const excludedDatabases = config.databases
      .filter(db => db.isExclude || config.listMode === 'exclude')
      .map(db => db.name)

    const includedDatabases = config.listMode === 'include' ? config.databases
      .filter(db => !db.isExclude)
      .map(db => db.name) : []

    /* -----------------------------------------
    ------------------- NOTE -------------------
    Interation flow
    - Get all databases from the source cluster
    - Get all databases from the target cluster
    ----------------------------------------- */

    /**
     * Load source data from the source cluster (current mongosh)
     */
    const loadSourceData = () => {
      const dbConfigs = new Map<string, Validation.Database>()
      // db = this is the current mongosh
      const sourceDbConn = db
      const sourceDbs = getDatabases(db)
        .filter(db => {
          // TODO: Improve this performance by reduce interation of the array, maybe use Map
          const currentDbConfig = config.databases.find(dbConfig => dbConfig.name === db)

          const result = config.listMode === 'include' ?
            (!excludedDatabases.includes(db) && includedDatabases.includes(db))
            : !excludedDatabases.includes(db)

          if (currentDbConfig) {
            dbConfigs.set(db, currentDbConfig)
          }

          return result
        })

      console.log('Source DBs:')
      console.log(sourceDbs)

      const targetDbConn = connectTarget(config.target)
      console.log()
      /**
       * Query data from the source cluster and target cluster
       * by the database name from the source cluster
       */
      for (const dbName of sourceDbs) {
        console.log(`\tdb > ${dbName}`)
        // Get the database config
        const dbConfig = dbConfigs.get(dbName)

        const excludedCollections: string[] = []
        const includedCollections: string[] = []

        if (dbConfig && dbConfig.collections) {
          dbConfig.collections.forEach(col => {
            (dbConfig.listMode === 'exclude' ? dbConfig.collections.includes(col) : !dbConfig.collections.includes(col))
              && excludedCollections.push(col)

            dbConfig.listMode === 'include' && dbConfig.collections.includes(col)
              && includedCollections.push(col)
          })
        }

        console.log('\t\texcludedCollections:', excludedCollections)
        console.log('\t\tincludedCollections:', includedCollections)

        // Get all collections from the source cluster
        const sourceCollections = getCollections(sourceDbConn, dbName)
          .filter(col => {
            if (!dbConfig) {
              return true
            }

            const result = dbConfig.listMode === 'include' ?
              includedCollections.includes(col) :
              !excludedCollections.includes(col)

            // console.log('dbConfig.listMode', dbConfig.listMode, '- col', col, '- result', result)

            return result
          }
        )

        // Get all collection options
        const collectionOptions = new Map<string, Validation.CollectionOptions>()
        // Get all collection definations
        const collectionDefs = dbConfig && dbConfig.collectionDefinition || []
        // Exclude collection options filter from excludedCollections and set to Map
        collectionDefs.forEach(colDef => sourceCollections.includes(colDef.name) && collectionOptions.set(colDef.name, colDef.options))

        console.log()
        console.log('\tCollections:')
        console.log(`\tcoll > ${sourceCollections}`)
        console.log()

        const collectionReports: Validation.CollectionReport[] = []

        for (const collection of sourceCollections) {
          const tcol1 = Date.now()

          const collOption = collectionOptions.get(collection)
          const docLimit = collOption?.maximumDocumentsPerRound || 1000

          let currentSourceDocCount = 0 // Current document count
          let currentTargetDocCount = 0 // Current document count
          const sourceHashes: string[] = []
          const targetHashes: string[] = []

          let mismatchCount = 0
          let matchCount = 0

          let round = 1

          const aggregatePipelineGenerator = generateAggregatePipeline(collOption).initalize()
          // Get all documents until the run out of documents
          while (true) {

            const aggregatePipeline = aggregatePipelineGenerator
              .setRound(round)
              .generate()

            if (debugMode === 'full') {
              console.log()
              console.log()
              console.log('----------------- AGGEGRATE PIPELINE -----------------')
              console.log()
              console.log(aggregatePipeline)
              console.log()
              console.log()
            }

            const t1 = Date.now()
            const sourceColl = sourceDbConn.getSiblingDB(dbName).getCollection(collection)
            console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Retrieving documents...`)
            const t3 = Date.now()
            console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Source] - Retrieving documents...`)
            const sourceDocuments = getDocuments(sourceColl, aggregatePipeline)
            console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Source] - Retrieving documents - Done - [${Date.now() - t3}ms]`)

            console.log()
            const t4 = Date.now()
            console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Target] - Retrieving documents...`)
            const targetColl = targetDbConn.getSiblingDB(dbName).getCollection(collection)
            const targetDocuments = getDocuments(targetColl, aggregatePipeline)
            console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Target] - Retrieving documents - Done - [${Date.now() - t4}ms]`)
            console.log()
            ++round
            console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Retrieving documents - Done - [${Date.now() - t1}ms]`)

            const t2 = Date.now()

            let hashedSourceDocs = ''
            let hashedTargetDocs = ''

            if (debugMode === 'full') {
              console.log()
              console.log()
              console.log('==================================================')
              console.log('#####################################################################################')
              console.log()
              console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
              console.log(`Source documents - [Length: ${sourceDocuments.length}]`)
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
              console.log(sourceDocuments)
              console.log()
              console.log('#####################################################################################')
              console.log()
              console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
              console.log(`Target documents - [Length: ${sourceDocuments.length}]`)
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
              console.log(targetDocuments)
              console.log('==================================================')
              console.log()
              console.log()

              createReportFile(`${dbName}.${collection}.source`, {
                metaData: {
                  source: { length: sourceDocuments.length },
                  target: { length: targetDocuments.length },
                },
                sourceDocuments,
                targetDocuments,
              })
            }

            if (collOption && collOption.hasTTL) {
              isDebug && console.log('\t\t[DEBUG] [HAS TTL index]')
              isDebug && console.log(`\t\t[DEBUG] Hased Match enabled: ${collOption.disabledHashedMatch !== true}`)

              if (collOption.disabledHashedMatch) {
                // if it is TTL index collection
                // validate from the total count documents instead
                console.log(`[${dayjs().format('HH:mm:ss')}]\t\tCounting documents...`)
                sourceHashes.push(sourceDocuments.length.toString())
                targetHashes.push(targetDocuments.length.toString())

                console.log(`\t\tSource Documents: ${sourceDocuments.length}`)
                console.log(`\t\t\tCount: ${sourceDocuments.length}`)
                console.log(`\t\tTarget Documents: ${targetDocuments.length}`)
                console.log(`\t\t\tCount: ${targetDocuments.length}`)
                console.log(`\t\tResult: ${sourceDocuments.length === targetDocuments.length ? 'Match' : 'Mismatch'}`)
                console.log()

              } else {
                console.log(`[${dayjs().format('HH:mm:ss')}]\t\tHashing documents...`)
                hashedSourceDocs = hashBigObject(sourceDocuments)
                hashedTargetDocs = hashBigObject(targetDocuments)
                console.log(`[${dayjs().format('HH:mm:ss')}]\t\tHased completed - [${Date.now() - t2}]`)
                // Add the hash to the array
                sourceHashes.push(hashedSourceDocs)
                targetHashes.push(hashedTargetDocs)

                console.log(`\t\tSource Documents: ${sourceDocuments.length}`)
                console.log(`\t\t\tHash: ${hashedSourceDocs}`)
                console.log(`\t\tTarget Documents: ${targetDocuments.length}`)
                console.log(`\t\t\tHash: ${hashedTargetDocs}`)
                console.log(`\t\tResult: ${hashedSourceDocs === hashedTargetDocs ? 'Match' : 'Mismatch'}`)
                console.log()
              }
            } else {
              // If it not TTL index collection
              isDebug && console.log('[DEBUG] NO TTL index')
              console.log(`[${dayjs().format('HH:mm:ss')}]\t\tHashing documents...`)
              // console.log('[DEBUG] sourceDocuments', typeof sourceDocuments)
              hashedSourceDocs = hashBigObject(sourceDocuments)
              // console.log('[DEBUG] targetDocuments', typeof targetDocuments)
              hashedTargetDocs = hashBigObject(targetDocuments)
              console.log(`[${dayjs().format('HH:mm:ss')}]\t\tHased completed - [${Date.now() - t2}]`)
              // Add the hash to the array
              sourceHashes.push(hashedSourceDocs)
              targetHashes.push(hashedTargetDocs)

              console.log(`\t\tSource Documents: ${sourceDocuments.length}`)
              console.log(`\t\t\tHash: ${hashedSourceDocs}`)
              console.log(`\t\tTarget Documents: ${targetDocuments.length}`)
              console.log(`\t\t\tHash: ${hashedTargetDocs}`)
              console.log(`\t\tResult: ${hashedSourceDocs === hashedTargetDocs ? 'Match' : 'Mismatch'}`)
              console.log()
            }

            currentSourceDocCount += sourceDocuments.length
            currentTargetDocCount += targetDocuments.length


            if (hashedSourceDocs !== hashedTargetDocs) {
              console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Source: ${currentSourceDocCount} - Target: ${currentTargetDocCount}`)
              console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Hash mismatch`)
              console.log('----------------------------------')
              console.log()
              mismatchCount++
              // break
            } else {
              matchCount++
            }
            console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Current mismatch: ${mismatchCount} / match: ${matchCount}`)

            // if (sourceDocuments.length < docLimit) {
            //   isDebug && console.log(`[DEBUG] Hit the limit of documents: ${sourceDocuments.length} < ${docLimit}`)
            //   break
            // }
            console.log(`[${dayjs().format('HH:mm:ss')}][INFO] \t${dbName}.${collection} - DONE - QR runs only once`)
            break
          }

          console.log()
          console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
          console.log()
          console.log('----------------------------------')
          console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Source: ${currentSourceDocCount} - Target: ${currentTargetDocCount}`)

          console.log(`[${dayjs().format('HH:mm:ss')}]\tTotal round: ${round - 1}`)
          const sourceHash = hashBigObject(sourceHashes)
          const targetHash = hashBigObject(targetHashes)
          console.log()
          console.log(`[${dayjs().format('HH:mm:ss')}]\tSource Hash: ${sourceHash} - Target Hash: ${targetHash}`)
          console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - ${sourceHash === targetHash ? 'Match' : 'Mismatch'}`)
          console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - All mismatch: ${mismatchCount} / match: ${matchCount} out of ${round - 1} rounds`)

          const totalTime = Date.now() - tcol1
          console.log()
          console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Done [${totalTime}ms]`)
          console.log('--------------------------------------------------')

          console.log()
          console.log('\t Creating collection report...')

          // Create report
          const collectionReport: Validation.CollectionReport = {
            collectionName: collection,
            isValid: sourceHash === targetHash,
            totalTime,
            stats: {
              source: {
                count: currentSourceDocCount,
                hash: sourceHash,
              },
              target: {
                count: currentTargetDocCount,
                hash: targetHash,
              },
            },
          }

          collectionReports.push(collectionReport)

          console.log()
        }
        console.log('\t Creating database report...')
        const dbReport: Validation.DatabaseReport = {
          dbName,
          isValid: collectionReports.every(col => col.isValid),
          collections: collectionReports,
        }

        reports.set(dbName, dbReport)
        console.log()
        console.log('====================== DONE ======================')
        console.log()
        console.log('****************')
        console.log()
      }

      console.log()
      console.log('=================================================')
      console.log('================ Validation DONE ================')
      console.log('=========VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV=========')
      console.log()
      console.log('=================================================')
      console.log('==================== REPORT =====================')
      console.log('=================================================')
      console.log()
      console.log(reports)
    }

    loadSourceData()

    console.log('\n\t*** QC Process done, and exitting ***')
  }

  start(config)
})()