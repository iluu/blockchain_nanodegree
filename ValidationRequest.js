'use strict';

/**
 * Stores validation requests used in the mempool
 * Also used as a response object for requestValidation
 */
class ValidationRequest {

    constructor(address, requestTime, timeout){

        this.walletAddress = address;
        this.requestTimeStamp = requestTime;
        this.message = `${address}:${requestTime}:starRegistry`;
        this.validationWindow = timeout;
        this.messageSignature = undefined;

    };
}

module.exports = ValidationRequest;
