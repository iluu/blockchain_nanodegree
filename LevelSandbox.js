/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key, function(err, value){
                if (err) return console.log('LS: Value for key [' + key +'] not found', err);
                resolve(value);
            })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) return console.log('LS: Failed to store new value for key [' + key, err);
                resolve(value)
            })
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let count = 0;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
                .on('data', function(data){
                    count++;
                })
                .on('error', function(err){
                    reject(err);
                })
                .on('close', function(){
                    resolve(count);
                })
        });
    }
}

module.exports.LevelSandbox = LevelSandbox;