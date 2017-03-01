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
			.exec()
			.catch(reason => {
				return Promise
					.reject(`${request.$verb} ${request.$endpoint} FAILED. \nDependencies not met:\n${reason}`);
			});
	}

	fetchDependencies(dependencies) {
		dependencies = dependencies.map(d => this.execByAlias(d));

		return Promise.all(dependencies).then(() => this.cache);
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

			return new Request(doc[key], this);
		});
	}
}

module.exports = RequestList;
