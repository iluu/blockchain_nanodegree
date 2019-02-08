'use strict';

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

/**
 * Stores and validates blockchain using LevelDB
 */
class BlockChain {

    constructor() {

        const story = Buffer.from('Genesis Star').toString('hex');
        this.genesisStar = JSON.parse(`{ "address": "13Ps1qPQALKwXKYNPDi2enycoYEN2hZbGu", "star": { "dec": "25° 29' 23.9", "ra": "12h 50m 26.0s"}}`);
        this.genesisStar.star.story = story;
        this.bd = new LevelSandbox();
    }

    generateGenesisBlock(){

        const genesisBlock = new Block(this.genesisStar);
        genesisBlock.time = this.getCurrentTime();
        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();

        return genesisBlock;
    }

    getBlockHeight() {

        const self = this;
        return this.bd.getBlocksCount()
            .then((height) => {

                if (height === 0) {
                    return self.bd.saveBlock(0, self.generateGenesisBlock())
                        .then(() => {

                            return 1;
                        });
                }

                return height;
            });
    }

    addBlock(block) {

        const self = this;
        return self.getBlockHeight()
            .then((it) => self.getBlockByHeight(it - 1))
            .then((previousBlock) => {

                block.height = previousBlock.height + 1;
                block.previousBlockHash = previousBlock.hash;
                block.time = self.getCurrentTime();
                block.hash = SHA256(JSON.stringify(block)).toString();
                return self.bd.saveBlock(block.height, block);
            });
    }

    getCurrentTime() {

        return new Date().getTime().toString().slice(0, -3);
    }

    getBlockByHash(hash){

        return this.bd.getBlockByHash(hash);
    }

    getBlocksByAddress(address){

        return this.bd.getBlocksByAddress(address);
    }

    getBlockByHeight(height) {

        const self = this;
        return this.getBlockHeight()
            .then((blockchainHeight) => {

                if (height < blockchainHeight) {
                    return self.bd.getBlockByHeight(height);
                }

                return null;
            });
    }

    validateBlock(height) {

        return this.getBlockByHeight(height)
            .then((block) => {

                const originalHash = block.hash;
                block.hash = '';

                const blockHash = SHA256(JSON.stringify(block)).toString();
                return [block.height, blockHash === originalHash];
            });
    }

    validateBlockInChain(height) {

        const blocks = [
            this.getBlockByHeight(height),
            this.getBlockByHeight(height + 1)
        ];
        return Promise.all(blocks)
            .then((results) => {

                results[0].hash = '';
                const blockHash = SHA256(JSON.stringify(results[0])).toString();
                return [results[0].height, (results[1].previousBlockHash === blockHash)];
            });
    }

    validateChain() {

        const self = this;
        return this.getBlockHeight().then((height) => {

            const validations = [];

            for (let i = 0; i < height; ++i){
                if (i < height - 1){
                    validations.push(self.validateBlockInChain(i));
                }
                else {
                    validations.push(self.validateBlock(i));
                }
            }

            return Promise.all(validations).then((results) => {

                const errorLog = [];
                results.forEach((element) => {

                    if (!element[1]) {
                        errorLog.push(element[0]);
                    }
                });
                return errorLog;
            });
        });
    }

    _modifyBlock(height, block) {

        const self = this;
        return new Promise((resolve, reject) => {

            self.bd.saveBlock(height, block)
                .then((blockModified) => {

                    resolve(blockModified);
                })
                .catch((err) => {

                    console.log(err);
                    reject(err);
                });
        });
    }
}

module.exports = BlockChain;
