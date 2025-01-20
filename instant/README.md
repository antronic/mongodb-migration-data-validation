# Instant script to run on Mongosh

## Compare the size of each collection in a single database

### 1. On Source Cluster

1. Connect to MongoDB Source Cluster using Mongosh
2. Navigate to the database you want to compare
```javascript
use <DATABASE>
```

3. Copy and paste from [`getSourceInfo.mongodb.js`](./getSourceInfo.mongodb.js)
4. Enter
5. Copy **`Base64 result`**
```javascript
// Sample
----------------------------------
Result:

W3siY29sbCI6Im1vdmllcyIsInNpemUiOjM0MDk1NDUyMCwiYjY0IjoiTXpRd09UVTBOVEl3WDIxdmRtbGxjdz09In1d
```

### 2. On Target Cluster

1. Connect to MongoDB Target Cluster using Mongosh
2. Navigate to the database you want to compare
```javascript
use <DATABASE>
```
3. Copy and paste from [`compareOnTarget.mongodb.js`](./compareOnTarget.mongodb.js)
4. Replace `<SOURCE_BASE64>` with **`Base64 result`** from the source cluster
5. Enter
6. Check the result

```javascript
// Sample
┌─────────┬────────┬──────────┬───────────┬────────────────────────────┐
│ (index) │ result │ coll     │ size      │ b64                        │
├─────────┼────────┼──────────┼───────────┼────────────────────────────┤
│ 0       │ true   │ 'movies' │ 340954520 │ 'MzQwOTU0NTIwX21vdmllcw==' │
└─────────┴────────┴──────────┴───────────┴────────────────────────────┘
```