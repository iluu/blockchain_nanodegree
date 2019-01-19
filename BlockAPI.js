'use strict';

const Hapi = require('hapi');

/**
 * Class Definition for the REST API
 */
class BlockAPI {

    /**
     * Constructor that allows initialize the class
     */
    constructor() {

        this.server = Hapi.Server({
            port: 8000,
            //host: '0.0.0.0'
            host: 'localhost'
        });
        this.initControllers();
        this.start();
    }

    /**
     * Initilization of all the controllers
     */
    initControllers() {

        require('./BlockController.js')(this.server);
    }

    async start() {

        try {
            await this.server.start();
            console.log(`Server running at: ${this.server.info.uri}\n`);
        }
        catch (err) {
            console.log(err);
            process.exit(1);
        }
    }

}

module.exports.BlockAPI = BlockAPI;
