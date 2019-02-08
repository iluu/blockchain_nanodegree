'use strict';

const BitcoinMessage = require('bitcoinjs-message');
const ValidationRequest = require('./ValidationRequest.js');
const ValidRequest = require('./ValidRequest.js');

/**
 * Temporary stores requests waiting for validation.
 * @param timeout - defines how long requests should be available for validation
 */
class MemPool {

    constructor(timeout) {

        this.timeoutRequests = [];
        this.mempool = [];
        this.mempoolValid = [];
        this.validationTimeout = timeout;
    }

    addRequestValidation(address){

        const self = this;
        const req = this.mempool[address];

        if (!req){
            this.mempool[address] = new ValidationRequest(
                address,
                this.currentTimestamp(),
                this.validationTimeout / 1000);

            this.timeoutRequests[address] =
                setTimeout(() => {

                    self.removeValidationRequest(address);
                }, this.validationTimeout);

            return this.mempool[address];
        }

        return this.verifyTimeLeft(req);
    }

    validateRequestByWallet(address, signature) {

        return new Promise((resolve, reject) => {

            const req = this.mempool[address];
            if (req && this.verifyTimeLeft(req).validationWindow > 0) {
                if (this.verifySignature(req, signature)){
                    return resolve(this.moveToValidMempool(req));
                }

                reject(`Failed to verify signature for validation request with address: '${address}'`);
            }
            else {
                reject(`No pending validation request for address: '${address}'`);
            }
        });
    }

    verifyAddressRequest(address){

        if (this.mempoolValid[address] !== undefined) {
            delete this.mempoolValid[address];
            return true;
        }

        return false;
    }

    verifyTimeLeft(req){

        const timeElapse = this.currentTimestamp() - req.requestTimeStamp;
        const timeLeft = (this.validationTimeout / 1000) - timeElapse;
        req.validationWindow = timeLeft;
        return req;
    }

    verifySignature(req, signature){

        req.messageSignature = BitcoinMessage.verify(req.message, req.walletAddress, signature);
        return req.messageSignature;
    }

    moveToValidMempool(req){

        const validRequest = new ValidRequest(req);
        this.mempoolValid[req.walletAddress] = validRequest;

        delete this.timeoutRequests[req.walletAddress];
        delete this.mempool[req.walletAddress];

        return validRequest;
    }

    currentTimestamp() {

        return (new Date().getTime().toString().slice(0,-3));
    }

    removeValidationRequest(address){

        delete this.mempool[address];
        delete this.timeoutRequests[address];
    }
}

module.exports = MemPool;
