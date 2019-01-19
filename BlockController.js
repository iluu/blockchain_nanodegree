'use strict';

const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server
     */
    constructor(server) {

        this.server = server;
        this.myBlockChain = new BlockChain.Blockchain();

        this.getStatus();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * GET Endpoint to get status of the blockchain, url: "/status"
     */
    getStatus() {

        const self = this;
        this.server.route({
            method:'GET',
            path:'/status',
            handler: async (request,h) => {

                const height = await self.myBlockChain.getBlockHeight();
                const errorLog = await self.myBlockChain.validateChain();

                const status = {
                    chainHeight: height,
                    valid: errorLog.length === 0
                };

                return status;
            }
        });
        console.log('registered GET route: /status');
    }

    /**
     * GET Endpoint to retrieve a block by index, url: "/block/:index"
     */
    getBlockByIndex() {

        const self = this;
        this.server.route({
            method: 'GET',
            path: '/block/{index}',
            handler: async (request, h) => {

                const index = request.params.index;
                const result = await self.myBlockChain.getBlock(index);

                if (result === null) {
                    const response = {
                        message: `Block ${index} not found`
                    };
                    return h.response(response).code(404);
                }

                return result;
            }
        });
        console.log('registered GET route: /block/{index}');
    }

    /**
     * POST Endpoint to add a new Block, url: "/block"
     */
    postNewBlock() {

        const self = this;
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async (request, h) => {

                if (request.payload !== null && request.payload.body) {
                    const body = request.payload.body;
                    const newBlock = new Block.Block(body);
                    const result = await self.myBlockChain.addBlock(newBlock);

                    return h.response(result).code(201);
                }

                const response = {
                    message: 'Missing required \'body\' param'
                };
                return h.response(response).code(400);
            }
        });
        console.log('registered POST route: /block');
    }
}

/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => {

    return new BlockController(server);
};
