'use strict';

const Level = require('level');

const chainDB = './chaindata';

class LevelSandbox {

    constructor() {

        this.db = Level(chainDB);
    }

    /**
     * Get data from levelDB with key
     * @param {*} key
     */
    getLevelDBData(key){

        const self = this;
        return new Promise((resolve, reject) => {

            self.db.get(key, (err, value) => {

                if (err) {
                    console.log(`LS: Value for key: [${key}] not found`, err);
                    reject(err);
                }

                resolve(value);
            });
        });
    }

    /**
     * Add data to levelDB with key and value
     * @param {*} key
     * @param {*} value
     */
    addLevelDBData(key, value) {

        const self = this;
        return new Promise((resolve, reject) => {

            self.db.put(key, value, (err) => {

                if (err) {
                    console.log('LS: Failed to store new value for key [' + key, err);
                    reject(err);
                }

                resolve(value);
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

                    console.log(`LS: getBlocsCount error: ${err}`);
                    reject(err);
                })
                .on('close', () => {

                    resolve(count);
                });
        });
    }
}

module.exports.LevelSandbox = LevelSandbox;
