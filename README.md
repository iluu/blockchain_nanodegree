# Project 3 - Private Blockchain with REST API

Changes: 
- v1.0.1 - added REST API with HapiJS that allows adding new blocks and inspecting blockchain
- v1.0.0 - simple private blockchain implementation with LevelDB

## Setup project for Review

To setup the project for review do the following:
1. Run __npm install__ to install project dependencies
2. Run __npm test__ to run all functional tests
3. Run __npm start__ to run server with default configuration

Alternatively, you could use Docker setup:
```bash
$ docker pull node:8.11.3
$ docker run -p 8000:8000/tcp -d -it --name devtest -v "$(pwd)":/home node:8.9.0
$ docker exec -it devtest /bin/bash
```

When in docker console, `cd home` and install project dependencies.
Run tests and start the project using npm commands above.

Note: By default project is configured to run on `localhost`, but this does not work when using docker, change host to `0.0.0.0` in `BlockApi.js` file.


## API

### GET /block/{index}
Returns block with given index. When block is not found returns `404 Not Found`.

```bash
$ curl -v localhost:8000/block/0

HTTP/1.1 200 OK
< content-type: application/json; charset=utf-8
< cache-control: no-cache
< content-length: 152
< accept-ranges: bytes
< Date: Sat, 19 Jan 2019 21:23:46 GMT
< Connection: keep-alive

{
    "hash":"be25e99417865c787635e4595f507a7264985d29689467b75a8aaa46316a6155",
    "height":0,
    "body":"Genesis Block",
    "time":"1547932751",
    "previousBlockHash":""
}
```

### POST /block
Adds new block to blockchain and returns it. Requires `body` request parameter.
Returns `400 Bad Request` when missing required payload.

```bash
curl -v \
     -d '{"body": "Test Block"}' \
     -H 'content-type:application/json' \
     "localhost:8000/block"

HTTP/1.1 201 Created
< content-type: application/json; charset=utf-8
< cache-control: no-cache
< content-length: 213
< Date: Sat, 19 Jan 2019 21:37:43 GMT
< Connection: keep-alive

{
    "hash":"bc526f8f36ef2e21f9e11c663cb566360870e8d493148176553443696be01159",
    "height":1,
    "body":"Test Block",
    "time":"1547933736",
    "previousBlockHash":"be25e99417865c787635e4595f507a7264985d29689467b75a8aaa46316a6155"
}
```

### GET /status
Additional endpoint for debugging. Returns current blockchain height and validation status.

```bash
curl -v localhost:8000/status

< HTTP/1.1 200 OK
< content-type: application/json; charset=utf-8
< cache-control: no-cache
< content-length: 30
< accept-ranges: bytes
< Date: Sat, 19 Jan 2019 21:40:17 GMT
< Connection: keep-alive
<

{   
    "chainHeight":2,
    "valid":true
}

## Resources
1) [HapiJS](https://hapijs.com/)
2) [Testing Hapi](https://github.com/pashariger/testing-hapi)