const RequestList = require('./requestList');
const Config = require('./config');
const { moduleVersion } = require('./shared');

class Beau {
    constructor(doc, env = {}) {
        this.config = new Config(doc, env);
        this.requests = new RequestList(this.config);

        if (this.config.VERSION !== moduleVersion()) {
            console.warn(
                `This Beau file expects v${
                    this.config.VERSION
                }. You are using v${moduleVersion()}.`
            );
        }
    }
}

module.exports = Beau;
