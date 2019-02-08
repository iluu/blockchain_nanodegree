'use strict';

const Level = require('level');

const chainDB = './chaindata';

class LevelSandbox {

    constructor() {

        this.db = Level(chainDB);
    }

    /**
     * Returns an array of blocks associated with given address
     */
    getBlocksByAddress(address){

        const self = this;
        const result = [];

        return new Promise((resolve, reject) => {

            self.db.createValueStream()
                .on('data', (data) => {

                    const block = JSON.parse(data);
                    if (block.body.address === address){
                        result.push(block);
                    }
                })
                .on('error', (err) => {

                    reject(err);
                })
                .on('close', () => {

                    resolve(result);
                });
        });
    }

    /**
     * Finds block with given hash
     */
    getBlockByHash(hash){

        const self = this;
        return new Promise((resolve, reject) => {

            self.db.createValueStream()
                .on('data', (data) => {

                    const block = JSON.parse(data);
                    if (block.hash === hash){
                        resolve(block);
                    }
                })
                .on('error', (err) => {

                    reject(err);
                })
                .on('close', () => {

                    resolve(null);
                });
        });
    }

    /**
     * Finds block by given height
     */
    getBlockByHeight(height){

        const self = this;
        return new Promise((resolve, reject) => {

            self.db.get(height, (err, value) => {

                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    /**
     * Stores block with given height
     */
    saveBlock(height, block) {

        const self = this;
        return new Promise((resolve, reject) => {

            const blockString = JSON.stringify(block);
            self.db.put(height, blockString, (err) => {

                if (err) {
                    reject(err);
                }
                else {
                    resolve(block);
                }
            });
        });
    }

    /**
     * Returns number of blocks stored in LevelDB
     */
    getBlocksCount() {

        const self = this;
        let count = 0;
        return new Promise((resolve, reject) => {

            self.db.createReadStream()
                .on('data', (data) => {

                    count++;
                })
                .on('error', (err) => {

                    reject(err);
                })
                .on('close', () => {

                    resolve(count);
                });
        });
    }
}

module.exports = LevelSandbox;
