'use strict';

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

/**
 * Stores and validates blockchain using LevelDB
 */
class Blockchain {

    constructor() {

        this.bd = new LevelSandbox.LevelSandbox();
    }

    generateGenesisBlock(){

        const genesisBlock = new Block.Block('Genesis Block');
        genesisBlock.time = this.getCurrentTime();
        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();

        return genesisBlock;
    }

    getBlockHeight() {

        const self = this;
        return this.bd.getBlocksCount()
            .then((height) => {

                if (height === 0) {
                    return self.bd.addLevelDBData(0, JSON.stringify(self.generateGenesisBlock()))
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
            .then((it) => self.getBlock(it - 1))
            .then((previousBlock) => {

                block.height = previousBlock.height + 1;
                block.previousBlockHash = previousBlock.hash;
                block.time = self.getCurrentTime();
                block.hash = SHA256(JSON.stringify(block)).toString();
                return self.bd.addLevelDBData(block.height, JSON.stringify(block)).then(JSON.parse);
            });
    }

    getCurrentTime() {

        return new Date().getTime().toString().slice(0, -3);
    }

    getBlock(height) {

        const self = this;
        return this.getBlockHeight()
            .then((blockchainHeight) => {

                if (height < blockchainHeight) {
                    return self.bd.getLevelDBData(height).then(JSON.parse);
                }

                return null;
            });
    }

    validateBlock(height) {

        return this.getBlock(height)
            .then((block) => {

                const originalHash = block.hash;
                block.hash = '';

                const blockHash = SHA256(JSON.stringify(block)).toString();
                return [block.height, blockHash === originalHash];
            });
    }

    validateBlockInChain(height) {

        const blocks = [
            this.getBlock(height),
            this.getBlock(height + 1)
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

            self.bd.addLevelDBData(height, JSON.stringify(block).toString())
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

module.exports.Blockchain = Blockchain;
