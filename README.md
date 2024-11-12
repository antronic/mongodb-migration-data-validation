# AWS DocumentDB <-> MongoDB Atlas Data Validation script

Project time spend:

[![wakatime](https://wakatime.com/badge/user/20f31d58-e08c-46c7-9266-c37aed16eebc/project/f1bb1daa-8cc9-429d-903e-033382d4388f.svg?style=for-the-badge)](https://wakatime.com/badge/user/20f31d58-e08c-46c7-9266-c37aed16eebc/project/f1bb1daa-8cc9-429d-903e-033382d4388f)

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
> //
> **Note**: This script is designed to be run on **a machine that can connect to both AWS DocumentDB and MongoDB Atlas over `mongosh`**
> -

1. Before you run the script, you need to **encrypt your TARGET (MongoDB Atlas) password** with provided encryption script.

To using the encryption script, you need to have the following information:


### Generate the `ENCRYPTION_KEY` and `ENCRYPTION_IV`
If you don't have the `ENCRYPTION_KEY` and `ENCRYPTION_IV`, you can generate them by running the following command
```bash
npm run cli generate-key
```

After you have the `ENCRYPTION_KEY` and `ENCRYPTION_IV`, you can run the encryption script by running the following command

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
3. Enter your **`MongoDB Atlas Database password`** and press `Enter`

Sample Output:
```bash
Enter your password:


##################################
Encrypted password:
----------------------------------

3b49ca2bc0cb298577e175cf02148b32

##################################
```
4. Copy the encrypted password and save it in the `config.js` file

5. Update the `config.js` file with the encryption password and other configurations

- See more details in the [Validation Configuration](/docs/data-types.md) section

---
```javascript
const config = {
  target: {
    hostname: '<MONGODB_ATLAS_HOSTNAME>',
    username: '<MONGODB_ATLAS_USERNAME>',
    encryptedPassword: '<ENCRYPTED_PASSWORD>',
  },
  listMode: 'include',
  databases: [
    {
      ...
```

6. After that, you can run the script by running the following command
```bash
mongosh --tls --tlsAllowInvalidHostnames --retryWrites=false <AWS_DOC_DB_HOSTNAME> --tlsCAFile ./global-bundle.pem --username <USERNAME> -f ./dist/index.js
```

Sample screenshots:
![](/docs/assets/images/validation-01.png)
![](/docs/assets/images/validation-02.png)
![](/docs/assets/images/validation-03.png)

## Disclaimer
This software is not supported by MongoDB, Inc. under any of their commercial support subscriptions or otherwise. Any usage of these script is at your own risk.