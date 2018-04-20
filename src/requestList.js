const Request = require('./request');
const RequestCache = require('./requestCache');
const httpVerbs = require('./shared').httpVerbs;

class RequestList {
	constructor(config = { REQUESTS: [] }) {
		this.config = config;
		this.REQUESTS = config.REQUESTS;

		this.list = this.loadRequests();
		this.cache = new RequestCache();

		this.cache.add(`env`, this.config.ENVIRONMENT);
	}

	async execByAlias(alias) {
		if (this.cache.exists(alias)) {
			return this.cache.get(alias);
		}

		const request = this.list.find(r => r.ALIAS === alias);

		if (typeof request === 'undefined') {
			throw new Error(`${alias} not found among the requests.`);
		}

		try {
			await this.fetchDependencies(Array.from(request.DEPENDENCIES));
			return await request.exec(this.cache);
		} catch (reason) {
			throw new Error(
				`Request: ${request.VERB} ${
					request.ENDPOINT
				} FAILED. \n${reason}`
			);
		}
	}

	async fetchDependencies(dependencies) {
		dependencies = dependencies.map(d => this.execByAlias(d));
		await Promise.all(dependencies);

		return this.cache;
	}

	loadRequests() {
		let requests = [];
		this.REQUESTS.forEach(request => {
			try {
				requests.push(new Request(request, this.config.PLUGINS));
			} catch (e) {
				throw new Error(`${request.request} was ignored: ${e}`);
			}
		});

		return requests;
	}
}

module.exports = RequestList;
