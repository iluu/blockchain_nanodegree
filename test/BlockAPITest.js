'use strict';

const Code = require('code');

const Lab = require('lab');

const BlockAPI = require('../app.js');

const lab = exports.lab = Lab.script();
const describe    = lab.describe;
const it          = lab.it;
const expect = Code.expect;
const server = BlockAPI.server;

describe('Block API with empty blockchain:', () => {

    it('GET /status returns 200 with block height and validation status', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/status'
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.chainHeight).to.equal(1);
        expect(response.result.valid).to.be.true();
    });

    it('GET /block/0 returns genesis block', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/block/0'
        });

        expect(response.statusCode).to.equal(200);

        expect(response.result.hash).to.not.equal('');
        expect(response.result.body).to.equal('Genesis Block');
        expect(response.result.height).to.equal(0);
        expect(response.result.time).to.be.above(0);
        expect(response.result.previousBlockHash).to.equal('');
    });

    it('GET /block/100 returns 404 not found response', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/block/100'
        });

        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.be.equal('Block 100 not found');
    });

    it('POST /block returns 201 created response with data of the created block', async () => {

        const genesisBlock = await server.inject({
            method: 'GET',
            url: '/block/0'
        });

        const response = await server.inject({
            method: 'POST',
            url: '/block',
            payload: '{ "body": "Test Block" }'
        });

        expect(response.statusCode).to.equal(201);

        expect(response.result.hash).to.not.equal('');
        expect(response.result.height).to.equal(1);
        expect(response.result.body).to.equal('Test Block');
        expect(response.result.time).to.be.above(0);
        expect(response.result.previousBlockHash).to.not.equal(genesisBlock.hash);
    });

    it('POST /block returns 400 bad request response when missing payload', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/block'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.be.equal('Missing required \'body\' param');
    });

    it('POST /block returns 400 bad request response when missing required payload params', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/block',
            payload: '{ "data": "Test Block" }'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.be.equal('Missing required \'body\' param');
    });
});
