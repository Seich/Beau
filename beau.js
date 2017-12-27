const deepMerge = require('deepmerge');

const RequestList = require('./requestList');
const requestRegex = require('./shared').requestRegex;

class Beau {
	constructor(doc) {
		this.defaults = {
			VERSION: 1,
			CACHE: false,
			ENDPOINT: '',
			PLUGINS: [],
			DEFAULTS: []
		};

		this.configKeys = Object.keys(this.defaults);
		this.config = this.loadConfig(doc);
		this.requests = this.getRequests(doc);
		this.requests = new RequestList(this.requests, this.config);
	}

	getRequests(doc) {
		let requests = Object.keys(doc).filter(key => {
			return requestRegex.test(key);
		});

		let results = {};
		requests.forEach(r => {
			if (typeof doc[r] === 'string') {
				results[r] = {
					ALIAS: doc[r]
				};
			} else {
				results[r] = doc[r];
			}

			results[r] = deepMerge(this.config.DEFAULTS, results[r]);
		});

		return results;
	}

	loadConfig(doc) {
		let result = this.defaults;

		Object.keys(doc)
			.filter(k => this.configKeys.indexOf(k.toUpperCase()) > -1)
			.forEach(k => (result[k.toUpperCase()] = doc[k]));

		return result;
	}
}

module.exports = Beau;
