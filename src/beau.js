const RequestList = require('./requestList');
const Config = require('./config');

class Beau {
	constructor(doc) {
		this.config = new Config(doc);

		this.requests = new RequestList(this.config.requests, this.config);
	}
}

module.exports = Beau;
