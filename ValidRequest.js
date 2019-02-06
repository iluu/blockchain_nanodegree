'use strict';

/**
 * Response object for /message-signature/validate request
 */
class ValidRequest {

    constructor(validationRequest){

        this.registerStar = true;
        this.status = {
            address: validationRequest.walletAddress,
            requestTimeStamp: validationRequest.requestTimeStamp,
            message: validationRequest.message,
            validationWindow: validationRequest.validationWindow,
            messageSignature: validationRequest.messageSignature
        };
    };
}

module.exports.ValidRequest = ValidRequest;
