const RequestList = require('./requestList');

class Beau {
	constructor(doc) {
		this.defaults = {
			VERSION: 1,
			CACHE: false,
			HOST: '',
			PLUGINS: []
		};


		this.configKeys = Object.keys(this.defaults);
		this.config = this.loadConfig(doc, this.defaults);
		this.requests = new RequestList(doc, this.config);
	}

	loadConfig(doc, defaults = {}) {
		var result = defaults;

		Object.keys(doc)
			.filter(k => this.configKeys.indexOf(k.toUpperCase()) > -1)
			.forEach(k => result[k.toUpperCase()] = doc[k]);

		return result;
	}
}


module.exports = Beau;
