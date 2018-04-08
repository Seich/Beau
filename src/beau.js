const RequestList = require('./requestList');
const Config = require('./config');

class Beau {
	constructor(doc, env = {}) {
		this.config = new Config(doc, env);
		this.requests = new RequestList(this.config);
	}
}

module.exports = Beau;
