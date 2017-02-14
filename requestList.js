const Request = require('./request');
const RequestCache = require('./requestCache');
const httpVerbs = require('./shared').httpVerbs;
class RequestList {
	constructor(doc = {}, config = {}) {
		this.config = config;
		this.list = this.loadRequests(doc);
		this.cache = new RequestCache();
	}

	execByAlias(alias) {
		let request = this.list.find(r => r.$alias === alias);

		if (typeof request === 'undefined') {
			return Promise.reject(`${alias} not found among the requests.`);
		}

		return request
			.exec(this, this.cache)
			.catch(reason => {
				return Promise.reject(`${request.$verb} ${request.$endpoint} FAILED.
Dependencies not met:
${reason}
				`);
			});
	}

	loadRequests(doc) {
		let requestKeys = Object.keys(doc)
			.filter(key => {
				let verb = key.split(' ')[0].toUpperCase();
				return httpVerbs.indexOf(verb) > -1;
			});

		return requestKeys.map(key => {
			doc[key] = doc[key] || {};

			doc[key].HOST = this.config.HOST;
			doc[key].request = key;

			return new Request(doc[key]);
		});
	}
}

module.exports = RequestList;
