# AWS DocumentDB <-> MongoDB Atlas Data Validation script

## Concept
This script is designed to validate the data between AWS DocumentDB and MongoDB Atlas.

It is designed to be run on a local machine that can connect to both AWS DocumentDB and MongoDB Atlas over `mongosh` and will compare the data between the two databases by hashing the raw data using [FarmHash](https://github.com/google/farmhash) function. The script will compare the data in the collections and output the differences between the two databases.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [`mongosh`](https://docs.mongodb.com/mongodb-shell/install/)
- Machine that can connect to both AWS DocumentDB and MongoDB Atlas
- Credentials for both AWS DocumentDB and MongoDB Atlas

## Installation
1. Clone the repository
2. Run `npm install` to install the dependencies

## Usage
1. Before you run the script, you need to **encrypt your TARGET (MongoDB Atlas) password** with my encryption script.

```bash
npm run cli
```

Output:
```bash
Available functions:
[1] Encrypt Password
[2] Decrypt Input
----------------------------------
Type the number of the function you want to use

Select a function:
```

2. Type `1` and press `Enter`
3. Enter your MongoDB Atlas password and press `Enter`
4. Copy the encrypted password and save it in the `config.js` file



## Disclaimer
This software is not supported by MongoDB, Inc. under any of their commercial support subscriptions or otherwise. Any usage of these script is at your own risk.