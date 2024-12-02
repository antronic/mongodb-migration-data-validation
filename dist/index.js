'use strict';

var dotenv = require('dotenv');
var dayjs = require('dayjs');
var crypto = require('crypto');
var murmurhash = require('murmurhash');

dotenv.config({ override: true });
const keyInput = process.env.ENCRYPTION_KEY;
const ivInput = process.env.ENCRYPTION_IV;
// const keyInput = 'b32d828c57918319aecf36646cc573d5c074d27e368816cf205ba81b18a67f02'
// const ivInput = '5d912769988d6781a1e16ffd197d5395'
// console.log('KEY > :', keyInput)
// console.log('IV > :', ivInput)
const decryptContent = (content) => {
    // console.log('KEY:', keyInput)
    // console.log('IV:', ivInput)
    if (keyInput === undefined || ivInput === undefined) {
        console.error('Please provide a KEY and IV in the .env file');
        console.error('or run the command:\n$\tnpm run cli generate-key');
        process.exit(1);
    }
    // crypto.randomBytes(32).toString('hex')
    const KEY = Buffer.from(keyInput, 'hex');
    // crypto.randomBytes(16).toString('hex')
    const IV = Buffer.from(ivInput, 'hex');
    console.log('KEY:', KEY.length);
    console.log('IV:', IV.length);
    if (KEY.length !== 32 || IV.length !== 16) {
        throw new Error('Invalid KEY or IV length. KEY must be 32 bytes and IV must be 16 bytes.');
    }
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
        let decrypted = decipher.update(content, 'hex', 'utf8'); // Check that 'content' is in hex format
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error("Decryption error:", error.message);
        throw error;
    }
};

/// <reference path="../types/validation.d.ts" />
/**
 *  Connect to the target cluster
 *
 * @param hostname Cluster hostname
 * @param user Cluster username
 * @param encrypedPassword Cluster password with encryption
 * @returns
 */
const connectTarget = ({ hostname, username, encryptedPassword }) => {
    const decryptedPassword = decryptContent(encryptedPassword);
    return connect(`mongodb://${username}:${decryptedPassword}@${hostname}?tls=true&tlsAllowInvalidHostnames=true&directConnection=true`);
};

/// <reference path="../types/shell.d.ts" />
/**
 * Get all databases exlcude admin, local, config, and defined in the exclude list
 *
 * @param _db
 */
const getDatabases = (_db) => {
    const excludeList = ['admin', 'local', 'config'];
    const dbs = _db.adminCommand({ listDatabases: 1 });
    const databases = [];
    dbs.databases.forEach((db) => {
        if (!excludeList.includes(db.name)) {
            databases.push(db.name);
        }
    });
    return databases;
};
/**
 * Get all collection names from the database
 *
 * @param _db
 * @param dbName
 * @returns
 */
const getCollections = (_db, dbName) => {
    const db = _db.getSiblingDB(dbName);
    const collections = db.getCollectionNames();
    return collections;
};
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
const getDocuments = (collection, collectionOptions, round = 1, timeField = 'created_at', start = dayjs().toDate(), end = dayjs().toDate()) => {
    const limit = collectionOptions && collectionOptions.maximumDocumentsPerRound || 1000;
    const pipeline = [];
    if (collectionOptions && collectionOptions.hasTTL) {
        // const startDate = start
        const expireAfterSeconds = collectionOptions &&
            collectionOptions.hasTTL &&
            collectionOptions.expireAfterSeconds || 0;
        // let endDate = dayjs(end)
        //   .add(expireAfterSeconds, 'second')
        //   .subtract(1, 'hour')
        //   .toDate()
        const startDate = dayjs(start)
            .add(expireAfterSeconds, 'second')
            .subtract(30, 'minutes')
            .toDate();
        const _timeField = collectionOptions && collectionOptions.timeField || timeField;
        // pipeline.push({ $match: { [_timeField]: { $gte: startDate, $lt: endDate } } })
        pipeline.push({ $match: { [_timeField]: { $gte: startDate } } });
    }
    pipeline.push({ $sort: { _id: 1 } });
    pipeline.push({ $skip: (round - 1) * limit });
    pipeline.push({ $limit: limit });
    // console.log()
    // console.log('pipeline')
    // console.log(pipeline)
    // console.log()
    const documents = collection.aggregate(pipeline).toArray();
    return documents;
};

const hash = (str) => murmurhash.v3(str).toString();
const hashBigObject = (obj) => {
    if (typeof obj !== 'object') {
        return 'not an object';
    }
    const hashArray = Object.keys(obj)
        // We sort the keys to ensure the hash is consistent
        .sort()
        .map(key => {
        const value = obj[key];
        if (value === null) {
            return `${key}:null`;
        }
        if (value === undefined) {
            return `${key}:undefined`;
        }
        return `${key}:${typeof value === 'object' ? hashBigObject(value) : value}`;
    });
    return hash(hashArray.join(''));
    // try {
    // } catch (e: any) {
    //   console.log('error', e.message)
    //   return 'error'
    // }
};

// export const loadConfig = (config: Validation.ValidationConfig) => {
//   const filteredDatabases = config.databases.filter(db => !db.isExclude)
//   const excludedDatabases = config.databases.filter(db => db.isExclude)
// }
const reports = new Map();
const start = (config) => {
    const excludedDatabases = config.databases
        .filter(db => db.isExclude || config.listMode === 'exclude')
        .map(db => db.name);
    const includedDatabases = config.listMode === 'include' ? config.databases
        .filter(db => !db.isExclude)
        .map(db => db.name) : [];
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
        const dbConfigs = new Map();
        // db = this is the current mongosh
        const sourceDbConn = db;
        const sourceDbs = getDatabases(db)
            .filter(db => {
            // TODO: Improve this performance by reduce interation of the array, maybe use Map
            const currentDbConfig = config.databases.find(dbConfig => dbConfig.name === db);
            const result = config.listMode === 'include' ?
                (!excludedDatabases.includes(db) && includedDatabases.includes(db))
                : !excludedDatabases.includes(db);
            if (currentDbConfig) {
                dbConfigs.set(db, currentDbConfig);
            }
            return result;
        });
        console.log('Source DBs:');
        console.log(sourceDbs);
        const targetDbConn = connectTarget(config.target);
        getDatabases(targetDbConn);
        // console.log(targetDbs)
        console.log();
        /**
         * Query data from the source cluster and target cluster
         * by the database name from the source cluster
         */
        for (const dbName of sourceDbs) {
            console.log(`\tdb > ${dbName}`);
            // Get the database config
            const dbConfig = dbConfigs.get(dbName);
            const excludedCollections = [];
            const includedCollections = [];
            if (dbConfig && dbConfig.collections) {
                dbConfig.collections.forEach(col => {
                    (dbConfig.listMode === 'exclude' ? dbConfig.collections.includes(col) : !dbConfig.collections.includes(col))
                        && excludedCollections.push(col);
                    dbConfig.listMode === 'include' && dbConfig.collections.includes(col)
                        && includedCollections.push(col);
                });
            }
            console.log('\t\texcludedCollections:', excludedCollections);
            console.log('\t\tincludedCollections:', includedCollections);
            // Get all collections from the source cluster
            const sourceCollections = getCollections(sourceDbConn, dbName)
                .filter(col => {
                if (!dbConfig) {
                    return true;
                }
                const result = dbConfig.listMode === 'include' ?
                    includedCollections.includes(col) :
                    !excludedCollections.includes(col);
                // console.log('dbConfig.listMode', dbConfig.listMode, '- col', col, '- result', result)
                return result;
            });
            // Get all collection options
            const collectionOptions = new Map();
            // Get all collection definations
            const collectionDefs = dbConfig && dbConfig.collectionDefinition || [];
            // Exclude collection options filter from excludedCollections and set to Map
            collectionDefs.forEach(colDef => sourceCollections.includes(colDef.name) && collectionOptions.set(colDef.name, colDef.options));
            console.log();
            console.log('\tCollections:');
            console.log(`\tcoll > ${sourceCollections}`);
            console.log();
            const collectionReports = [];
            for (const collection of sourceCollections) {
                const tcol1 = Date.now();
                const collOption = collectionOptions.get(collection);
                const docLimit = (collOption === null || collOption === void 0 ? void 0 : collOption.maximumDocumentsPerRound) || 1000;
                let currentSourceDocCount = 0; // Current document count
                let currentTargetDocCount = 0; // Current document count
                const sourceHashes = [];
                const targetHashes = [];
                let round = 1;
                // Get all documents until the run out of documents
                while (true) {
                    const t1 = Date.now();
                    const sourceColl = sourceDbConn.getSiblingDB(dbName).getCollection(collection);
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Retrieving documents...`);
                    const t3 = Date.now();
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Source] - Retrieving documents...`);
                    const sourceDocuments = getDocuments(sourceColl, collOption, round);
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Source] - Retrieving documents - Done - [${Date.now() - t3}ms]`);
                    console.log();
                    const t4 = Date.now();
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Target] - Retrieving documents...`);
                    const targetColl = targetDbConn.getSiblingDB(dbName).getCollection(collection);
                    const targetDocuments = getDocuments(targetColl, collOption, round);
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t\t [Target] - Retrieving documents - Done - [${Date.now() - t4}ms]`);
                    console.log();
                    ++round;
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Retrieving documents - Done - [${Date.now() - t1}ms]`);
                    const t2 = Date.now();
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t\tHashing documents...`);
                    console.log('[DEBUG] sourceDocuments', typeof sourceDocuments);
                    const hasedSourceDocs = hashBigObject(sourceDocuments);
                    console.log('[DEBUG] targetDocuments', typeof targetDocuments);
                    const hasedTargetDocs = hashBigObject(targetDocuments);
                    console.log(`[${dayjs().format('HH:mm:ss')}]\t\tHased completed - [${Date.now() - t2}]`);
                    // Add the hash to the array
                    sourceHashes.push(hasedSourceDocs);
                    targetHashes.push(hasedTargetDocs);
                    console.log(`\t\tSource Documents: ${sourceDocuments.length}`);
                    console.log(`\t\t\tHash: ${hasedSourceDocs}`);
                    console.log(`\t\tTarget Documents: ${targetDocuments.length}`);
                    console.log(`\t\t\tHash: ${hasedTargetDocs}`);
                    console.log(`\t\tResult: ${hasedSourceDocs === hasedTargetDocs ? 'Match' : 'Mismatch'}`);
                    console.log();
                    currentSourceDocCount += sourceDocuments.length;
                    currentTargetDocCount += targetDocuments.length;
                    if (sourceDocuments.length < docLimit) {
                        break;
                    }
                    if (hasedSourceDocs !== hasedTargetDocs) {
                        console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Source: ${currentSourceDocCount} - Target: ${currentTargetDocCount}`);
                        console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Hash mismatch`);
                        console.log('----------------------------------');
                        break;
                    }
                }
                console.log('----------------------------------');
                console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Source: ${currentSourceDocCount} - Target: ${currentTargetDocCount}`);
                console.log(`[${dayjs().format('HH:mm:ss')}]\tTotal round: ${round - 1}`);
                const sourceHash = hashBigObject(sourceHashes);
                const targetHash = hashBigObject(targetHashes);
                console.log();
                console.log(`[${dayjs().format('HH:mm:ss')}]\tSource Hash: ${sourceHash} - Target Hash: ${targetHash}`);
                console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - ${sourceHash === targetHash ? 'Match' : 'Mismatch'}`);
                const totalTime = Date.now() - tcol1;
                console.log();
                console.log(`[${dayjs().format('HH:mm:ss')}]\t${dbName}.${collection} - Done [${totalTime}ms]`);
                console.log('--------------------------------------------------');
                console.log();
                console.log('\t Creating collection report...');
                // Create report
                const collectionReport = {
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
                };
                collectionReports.push(collectionReport);
                console.log();
            }
            console.log('\t Creating database report...');
            const dbReport = {
                dbName,
                isValid: collectionReports.every(col => col.isValid),
                collections: collectionReports,
            };
            reports.set(dbName, dbReport);
            console.log();
            console.log('====================== DONE ======================');
            console.log();
            console.log('****************');
            console.log();
        }
        console.log();
        console.log('=================================================');
        console.log('================ Validation DONE ================');
        console.log('=========VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV=========');
        console.log();
        console.log('=================================================');
        console.log('==================== REPORT =====================');
        console.log('=================================================');
        console.log();
        console.log(reports);
    };
    loadSourceData();
    console.log('\n Process done');
};

// Command line interface
(function () {
    dotenv.config({ override: true });
    // console.log('test')
    const config = require('./config.js');
    // console.log('config')
    // console.log(config)
    // const config: Validation.ValidationConfig = {
    //   target: {
    //     hostname: 'localhost:29001',
    //     username: 'observer',
    //     encryptedPassword: 'c425c6bec211d2e0c9d37185a4asdc22edes'
    //   },
    //   listMode: 'include',
    //   databases: [
    //     {
    //       name: 'jirac',
    //       isExclude: false,
    //       listMode: 'exclude',
    //       collections: [],
    //       collectionDefinition: [
    //         {
    //           name: 'transactions_1',
    //           options: {
    //             maximumDocumentsPerRound: 100,
    //             hasTTL: true,
    //             timeField: 'created_at',
    //             expireAfterSeconds: 60 * 60 * 24 * 30,
    //             indexName: 'created_at_1',
    //           },
    //         },
    //       ],
    //     },
    //     {
    //       name: 'test',
    //       isExclude: false,
    //       listMode: 'exclude',
    //       collections: [],
    //       collectionDefinition: [],
    //     },
    //   ]
    // }
    start(config);
})();
