'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Hex2ascii = require('hex2ascii');

const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');
const MemPool = require('./MemPool.js');

const TimeoutRequestsWindowTimeSeconds = 300;
const TimeoutRequestsWindowTime = TimeoutRequestsWindowTimeSeconds * 1000;
/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class StarNotaryController {

    constructor(server) {

        this.server = server;
        this.myBlockChain = new BlockChain();
        this.mempool = new MemPool(TimeoutRequestsWindowTime);

        this.postRequestValidation();
        this.postValidateMessageSignature();
        this.postNewStar();
        this.getStarByAddressOrHash();
        this.getStarByHeight();

        this.getStatus();
    }

    postRequestValidation() {

        const self = this;
        this.server.route({
            method: 'POST',
            path:'/requestValidation',
            config: {
                validate: {
                    payload: {
                        address: Joi.string().required()
                    }
                }
            },
            handler: async (request, h) => {

                const result = await self.mempool.addRequestValidation(request.payload.address);

                if (result.validationWindow === TimeoutRequestsWindowTimeSeconds){
                    return h.response(result).code(200);
                }

                return h.response(result).code(201);
            }
        });
        console.log('registered POST route: /requestValidation');
    }

    postValidateMessageSignature() {

        const self = this;
        this.server.route({
            method: 'POST',
            path:'/message-signature/validate',
            config: {
                validate: {
                    payload: {
                        address: Joi.string().required(),
                        signature: Joi.string().required()
                    }
                }
            },
            handler: async (request, h) => {

                return await self.mempool
                    .validateRequestByWallet(request.payload.address, request.payload.signature)
                    .catch((err) => {

                        return Boom.badRequest(err);
                    });
            }
        });
        console.log('registered POST route: /message-signature/validate');
    }

    postNewStar() {

        const self = this;
        this.server.route({
            method: 'POST',
            path: '/block',
            config: {
                validate: {
                    payload: {
                        address: Joi.string().required(),
                        star: Joi.object().keys({
                            dec: Joi.string().required(),
                            ra: Joi.string().required(),
                            mag: Joi.string().optional(),
                            cen: Joi.string().optional(),
                            story: Joi.string().required()
                        })
                    }
                }
            },
            handler: async (request, h) => {

                const isValid = await self.mempool.verifyAddressRequest(request.payload.address);
                if (!isValid){
                    return Boom.badRequest(`Unable to add star: no valid request for '${request.payload.address}' found`);
                }

                const data = this.encode(request);
                const newBlock = new Block(data);

                return this.myBlockChain
                    .addBlock(newBlock)
                    .then((addedBlock) => {

                        // this is ugly but without it, it adds "undefined" for mag and cen
                        const response = JSON.stringify(addedBlock);
                        return h.response(JSON.parse(response)).code(201);
                    });
            }
        });
        console.log('registered POST route: /block');
    }

    encode(req){

        return {
            address: req.payload.address,
            star: {
                ra: req.payload.star.ra,
                dec: req.payload.star.dec,
                mag: req.payload.star.mag,
                cen: req.payload.star.cen,
                story: Buffer.from(req.payload.star.story).toString('hex')
            }
        };
    }

    getStarByAddressOrHash() {

        const self = this;
        this.server.route({
            method: 'GET',
            path: '/stars/{search}',
            options: {
                validate: {
                    params: {
                        search: Joi.string().required()
                    }
                }
            },
            handler: async (request, h) => {

                if (request.params.search.startsWith('hash')){
                    const hash = request.params.search.split(':')[1];
                    const result = await self.myBlockChain.getBlockByHash(hash);
                    if (result === null) {
                        return Boom.notFound(`No stars with ${request.params.search} found`);
                    }

                    result.body.star.storyDecoded = Hex2ascii(result.body.star.story);
                    return result;
                }

                if (request.params.search.startsWith('address')){
                    const address = request.params.search.split(':')[1];
                    const result = await self.myBlockChain.getBlocksByAddress(address);
                    if (result === null || result.length < 1) {
                        return Boom.notFound(`No stars with ${request.params.search} found`);
                    }

                    result.map((entry) => {

                        entry.body.star.storyDecoded = Hex2ascii(entry.body.star.story);
                    });
                    return result;
                }
            }
        });
        console.log('registered GET route: /stars/{search}');
    }

    getStarByHeight() {

        const self = this;
        this.server.route({
            method: 'GET',
            path: '/block/{height}',
            options: {
                validate: {
                    params: {
                        height: Joi.number().required()
                    }
                }
            },
            handler: async (request, h) => {

                const height = request.params.height;
                const result = await self.myBlockChain.getBlockByHeight(height);
                if (result === null) {
                    return Boom.notFound(`No stars with height ${height} found`);
                }

                result.body.star.storyDecoded = Hex2ascii(result.body.star.story);
                return result;
            }
        });
        console.log('registered GET route: /block/{index}');
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
}

/**
 * Exporting the StarNotaryController class
 * @param {*} server
 */
module.exports = (server) => {

    return new StarNotaryController(server);
};
