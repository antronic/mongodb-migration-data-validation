function getDbStats(_db) {
	let colls = _db.getCollectionNames().sort()
	return colls.map(getColllB64)
}

function getColllB64(coll) {
	const size = db[coll].stats().size
	return { coll, size, b64: btoa(size + '_' + coll) }
}

function compareWithTarget(sourceBase64) {
	let sourceInfo = JSON.parse(atob(sourceBase64))

	const compareResult = sourceInfo.map((collInfo) => {
		const b64 = getColllB64(collInfo.coll).b64
		return {
			result: b64 === collInfo.b64,
			// target: hash,
			// source: collInfo.b64,
			...collInfo
		}
	})

	return compareResult
}

// -------------------------------------------------------


let sourceBase64 = '<SOURCE_BASE64>' // Paste Source Hash here
console.table(compareWithTarget(sourceBase64))