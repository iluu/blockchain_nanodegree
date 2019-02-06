'use strict';

const Code = require('code');

const Lab = require('lab');

const Lolex = require('lolex');

const BlockAPI = require('../app.js');

const lab = exports.lab = Lab.script();
const describe    = lab.describe;
const it          = lab.it;
const expect = Code.expect;

const server = BlockAPI.server;

describe('Star API of Notary Service handles', () => {

    const requestTimeStamp = 1544454641;
    const walletAddress = '1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs';
    const validSignature = 'IASF4L7Q1nsXn2MzW2uc8apjIARMRCfirsGVhq5ZwA37IxUsurYGyHtU0k/kBmIwWLLUNqitUHPMhZJMFZ5SSnA=';
    const invalidSignature = 'FASF4L7Q1nsXn2MzW2uc8apjIARMRCfirsGVhq5ZwA37IxUsurYGyHtU0k/kBmIwWLLUNqitUHPMhZJMFZ5SSnA=';

    const starBlockNoDecodedStory = `{
        "hash": "65a6cf9e43c3d3dfa8e9785e9e637545665fea02ff71a9a8c10013a73281e4d9",
        "height": 1,
        "body": {
        "address": "${walletAddress}",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
            }
        },
        "time": "1544454651",
        "previousBlockHash": "19d5d866bece894da5be9e3e895698782fe27e339029d7260f4e757b842bae8f"
    }`;

    const starBlock = `{
            "hash": "65a6cf9e43c3d3dfa8e9785e9e637545665fea02ff71a9a8c10013a73281e4d9",
            "height": 1,
            "body": {
              "address": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs",
              "star": {
                "ra": "16h 29m 1.0s",
                "dec": "68° 52' 56.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
              }
            },
            "time": "1544454651",
            "previousBlockHash": "19d5d866bece894da5be9e3e895698782fe27e339029d7260f4e757b842bae8f"
        }`;

    const clock = Lolex.install({ shouldAdvanceTime: true, now: new Date(requestTimeStamp * 1000) });

    it('POST /requestValidation without required payload and returns 400 Bad Request response', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/requestValidation'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal('Invalid request payload input');
    });

    it('POST /requestValidation for known wallet address and returns 200 with updated ValidationRequest response', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/requestValidation',
            payload: `{ "address":"${walletAddress}" }`
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.walletAddress).to.equal(walletAddress);
        expect(response.result.requestTimeStamp).to.be.equal(`${requestTimeStamp}`);
        expect(response.result.message).to.equal(`${walletAddress}:${requestTimeStamp}:starRegistry`);
        expect(response.result.validationWindow).to.be.equal(300);
    });

    it('POST /requestValidation and returns 201 with created ValidationRequest', async () => {

        // advance time by 10s
        clock.tick(1000 * 10);

        const response = await server.inject({
            method: 'POST',
            url: '/requestValidation',
            payload: `{ "address":"${walletAddress}" }`
        });

        expect(response.statusCode).to.equal(201);
        expect(response.result.walletAddress).to.equal(walletAddress);
        expect(response.result.requestTimeStamp).to.be.equal(`${requestTimeStamp}`);
        expect(response.result.message).to.equal(`${walletAddress}:${requestTimeStamp}:starRegistry`);
        expect(response.result.validationWindow).to.equal(290);

    });

    it('POST /message-signature/validate without required payload and returns 400 Bad Request response', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/message-signature/validate'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal('Invalid request payload input');

    });

    it('POST /message-signature/validate and returns 400 Bad Request response when no pending validation request', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/message-signature/validate',
            payload: `{ "address":"fake-address", "signature":"fake-signature" }`
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal('No pending validation request for address: \'fake-address\'');

    });

    it('POST /message-signature/validate and returns 400 Bad Request response when signature invalid', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/message-signature/validate',
            payload: `{ "address":"${walletAddress}", "signature":"${invalidSignature}" }`
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(`Failed to verify signature for validation request with address: '${walletAddress}'`);

    });

    it('POST /message-signature/validate and returns 200 when pending validation request and signature valid', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/message-signature/validate',
            payload: `{ "address":"${walletAddress}", "signature":"${validSignature}" }`
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.registerStar).to.be.true();
        expect(response.result.status.address).to.be.equal(walletAddress);
        expect(response.result.status.requestTimeStamp).to.be.equal(`${requestTimeStamp}`);
        expect(response.result.status.message).to.equal(`${walletAddress}:${requestTimeStamp}:starRegistry`);
        expect(response.result.status.validationWindow).to.equal(290);
        expect(response.result.status.messageSignature).to.be.true();

    });

    it('POST /block without required payload and returns 400 Bad Request response', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/block'
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal('Invalid request payload input');
    });

    it('POST /block and returns 400 Bad Request response more than one star received', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/block',
            payload: `{ "address": "${walletAddress}", 
                        "star": [{ "dec": "68° 52' 56.9", "ra": "16h 29m 1.0s","story": "Found star using https://www.google.com/sky/" }, 
                                 { "dec": "68° 53' 56.9", "ra": "16h 29m 1.1s","story": "Found star using https://www.google.com/sky/" }]}`
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.be.equal('Invalid request payload input');

    });

    it('POST /block and returns 400 Bad Request response when no validated address entry', async () => {

        const response = await server.inject({
            method: 'POST',
            url: '/block',
            payload: `{ "address": "unknown-address", 
                        "star": { "dec": "68° 52' 56.9", "ra": "16h 29m 1.0s","story": "Found star using https://www.google.com/sky/" }}`
        });

        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.be.equal(`Unable to add star: no valid request for 'unknown-address' found`);

    });

    it('POST /block and returns 201 created response with data of the created block', async () => {

        const expectedResponse = JSON.parse(starBlockNoDecodedStory);
        const response = await server.inject({
            method: 'POST',
            url: '/block',
            payload: `{ "address": "1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs", 
                        "star": { "dec": "68° 52' 56.9", "ra": "16h 29m 1.0s","story": "Found star using https://www.google.com/sky/" }}`
        });

        expect(response.statusCode).to.equal(201);
        expect(expectedResponse).to.equal(response.result);

    });

    it('GET /stars/hash:{hash} and returns 404 not found when block does not exist ', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/stars/hash:000000'
        });

        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal('No stars with hash:000000 found');

    });

    it('GET /stars/hash:{hash} and returns 200 with given star data (includes additional field : storyDecoded) ', async () => {

        const expectedResponse = JSON.parse(starBlock);
        const response = await server.inject({
            method: 'GET',
            url: '/stars/hash:65a6cf9e43c3d3dfa8e9785e9e637545665fea02ff71a9a8c10013a73281e4d9'
        });

        expect(response.statusCode).to.equal(200);
        expect(expectedResponse).to.equal(response.result);

    });

    it('GET /stars/address:{address} and returns 404 not found when no blocks found ', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/stars/address:000000'
        });

        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal('No stars with address:000000 found');

    });

    it('GET /stars/address:{address} and returns 200 with list of stars associated with given address', async () => {

        const expectedResponse = JSON.parse(`[${starBlock}]`);
        const response = await server.inject({
            method: 'GET',
            url: '/stars/address:1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs'
        });

        expect(response.statusCode).to.equal(200);
        expect(expectedResponse).to.equal(response.result);

    });

    it('GET /block/{height} and returns 404 not found when no blocks found ', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/block/10'
        });

        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal('No stars with height 10 found');

    });

    it('GET /block/{height} and returns 404 not found when no blocks found ', async () => {

        const expectedResponse = JSON.parse(starBlock);
        const response = await server.inject({
            method: 'GET',
            url: '/block/1'
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equal(expectedResponse);
    });

    it('GET /status and returns 200 with blockchain height and validation status', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/status'
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.chainHeight).to.equal(2); // genesis block + star block
        expect(response.result.valid).to.be.true();

    });
});
