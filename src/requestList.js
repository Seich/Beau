const Request = require('./request');
const RequestCache = require('./requestCache');
const httpVerbs = require('./shared').httpVerbs;
const requireg = require('requireg');

class RequestList {
	constructor(requests = [], config = {}) {
		this.config = config;
		this.requests = requests;

		this.modifiers = this.loadPlugins();
		this.list = this.loadRequests();
		this.cache = new RequestCache();

		this.cache.add(`$env`, this.config.ENVIRONMENT);
	}

	async execByAlias(alias) {
		if (this.cache.exists(`$${alias}`)) {
			return this.applyPostResponseModifiers(this.cache.get(`$${alias}`));
		}

		const request = this.list.find(r => r.ALIAS === alias);

		if (typeof request === 'undefined') {
			throw new Error(`${alias} not found among the requests.`);
		}

		try {
			await this.fetchDependencies(Array.from(request.DEPENDENCIES));
			const response = await request.exec(this.modifiers, this.cache);

			return this.applyPostResponseModifiers(response);
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
		this.requests.forEach(request => {
			try {
				let r = new Request(request);
				requests.push(r);
			} catch (e) {
				throw new Error(`${request.request} was ignored: ${e}`);
			}
		});

		return requests;
	}

	loadPlugins() {
		if (typeof this.config.PLUGINS === 'undefined') {
			return [];
		}

		return this.config.PLUGINS.map(plugin => {
			let name = plugin;
			let settings = null;

			if (typeof plugin === 'object') {
				name = Object.keys(plugin)[0];
				settings = plugin[name];
			}

			return new (requireg(name))(settings);
		});
	}

	applyPostResponseModifiers(response) {
		this.modifiers.forEach(mod => {
			if (typeof mod.postResponse !== 'undefined') {
				mod.postResponse(response);
			}
		});

		return response;
	}
}

module.exports = RequestList;
