function getDbStats(_db) {
	let colls = _db.getCollectionNames().sort()
	return colls.map(getColllB64)
}

function getColllB64(coll) {
	const size = db[coll].stats().size
	return { coll, size, b64: btoa(size + '_' + coll) }
}

function getSourceB64() {
	let statsInfo = getDbStats(db)

	let h64 = btoa(JSON.stringify(statsInfo))

	return h64
}

const sourceB64 = getSourceB64()
console.log('----------------------------------\nResult:\n\n' + sourceB64)
