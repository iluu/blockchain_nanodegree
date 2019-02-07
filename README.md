# Project 4 - Private Blockchain Star Notary Service

Changes: 
- v1.0.2 - implemented star notary service
- [v1.0.1](https://github.com/iluu/blockchain_nanodegree/releases/tag/v1.0.1) - added REST API with HapiJS that allows adding new blocks and inspecting blockchain
- [v1.0.0](https://github.com/iluu/blockchain_nanodegree/releases/tag/v1.0.0) - simple private blockchain implementation with LevelDB

## Setup project for Review

To setup the project for review do the following:
1. Run __npm install__ to install project dependencies
2. Run __npm test__ to run all functional tests
3. Run __npm start__ to run server with default configuration
4. [Optional] Run __scripts/apitest.sh__ to run a small client shell script (assumes [jq](https://stedolan.github.io/jq/) is installed)

Alternatively, you could use Docker setup:
```bash
$ docker pull node:8.11.3
$ docker run -p 8000:8000/tcp -d -it --name devtest -v "$(pwd)":/home node:8.9.0
$ docker exec -it devtest /bin/bash
```

When in docker console, `cd home` and install project dependencies.
Run tests and start the project using npm commands above.

Note: By default project is configured to run on `localhost`, but this does not work when using docker, change host to `0.0.0.0` in `BlockApi.js` file.

## API Docs

### POST /requestValidation
Creates a validation request for given wallet address. Returns message to be signed.
Validation request expires after 5 minutes.

```bash
$ curl -v http://localhost:8000/requestValidation \
 -H 'Content-Type: application/json' \
 -H 'cache-control: no-cache' \
 -d '{"address":"1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs"}'
```

<details>
<summary>Response:</summary>

```json
{
  "walletAddress": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs",
  "requestTimeStamp": "1549489009",
  "message": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs:1549489009:starRegistry",
  "validationWindow": 300
}
```
</details>

### POST /message-signature/validate
Allows to confirm ownership of the address by sending message signature.
If signature is correct, user is allowed to register a star for a given address.

```bash
$ curl -v http://localhost:8000/message-signature/validate \
-H 'Content-Type: application/json' \
-H 'cache-control: no-cache' \
-d '{"address":"1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs", "signature":"valid signature"}'
```

<details>
<summary>Response:</summary>

```json
{
  "registerStar": true,
  "status": {
    "address": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs",
    "requestTimeStamp": "1549489582",
    "message": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs:1549489582:starRegistry",
    "validationWindow": 276,
    "messageSignature": true
  }
}
```
</details>

### POST /block
If wallet address was validated correctly, this method allows registering a single star entry. Returns newly created block as a confirmation.

```bash
curl -v http://localhost:8000/block \
-H 'Content-Type: application/json' \
-H 'cache-control: no-cache' \
-d '{"address":"1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs", 
     "star": {
         "dec": "68° 52 56.9",
         "ra":"16h 29m 1.0s",
         "story":"Found star using https://www.google.com/sky/"
         }
    }'
```

<details>
  <summary>Response</summary>
  
  ```json
  {
    "hash": "7db2d65f888b51836d54ce9b81425cb1d8b43753ec1b8032010ac79a01dbdf63",
    "height": 1,
    "body": {
        "address": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1549489959",
    "previousBlockHash": "e516c8a3872849dafa636b596e53456eb82bf048b8ce1e38fbde2d1ba6c0677c"
  }
  ```  
</details>

### GET /stars/hash:[HASH]
Returns a block by given hash

```bash
$ curl -v http://localhost:8000/stars/hash:[HASH]
```


### GET /stars/address:[ADDRESS]
Returns a block by given wallet address

```bash
$ curl -v http://localhost:8000/stars/address:[ADDRESS]
```


### GET /block/[HEIGHT]
Returns a block of given height

```bash
$ curl -v http://localhost:8000/block/[HEIGHT]
```

### GET /status
Returns validation status together with chain height

```bash
$ curl -v http://localhost:8000/block/[HEIGHT]
```

<details>
<summary>Response:</summary>

```json
{
  "chainHeight": 2,
  "valid": true
}
```
</details>

## Resources
1) [HapiJS](https://hapijs.com)
2) [Boom](https://github.com/hapijs/boom)
3) [Joi](https://github.com/hapijs/joi) 
4) [HapiBook](https://hapibook.jjude.com)
5) [Testing Hapi](https://github.com/pashariger/testing-hapi)
6) [Fake Timers in tests with Lolex](https://github.com/sinonjs/lolex)
