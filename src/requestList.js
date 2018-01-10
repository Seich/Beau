const Request = require('./request');
const RequestCache = require('./requestCache');
const httpVerbs = require('./shared').httpVerbs;
const requireg = require('requireg');

class RequestList {
	constructor(doc = {}, config = {}) {
		this.config = config;

		this.modifiers = this.loadPlugins();
		this.list = this.loadRequests(doc);
		this.cache = new RequestCache();
	}

	async execByAlias(alias) {
		const request = this.list.find(r => r.ALIAS === alias);

		if (typeof request === 'undefined') {
			throw new Error(`${alias} not found among the requests.`);
		}

		try {
			await this.fetchDependencies(Array.from(request.DEPENDENCIES));
			const response = await request.exec(this.modifiers, this.cache);

			this.modifiers.forEach(mod => {
				if (typeof mod.postResponse !== 'undefined') {
					mod.postResponse(response);
				}
			});

			return response;
		} catch (reason) {
			throw new Error(
				`Request: ${request.VERB} ${request.ENDPOINT} FAILED. \n${reason}`
			);
		}
	}

	async fetchDependencies(dependencies) {
		dependencies = dependencies.map(d => this.execByAlias(d));
		await Promise.all(dependencies);

		return this.cache;
	}

	loadRequests(doc) {
		const requests = Object.keys(doc).filter(key => {
			const verb = key.split(' ')[0].toUpperCase();
			return httpVerbs.indexOf(verb) > -1;
		});

		return requests.map(request => {
			doc[request] = doc[request] || {};
			doc[request].ENDPOINT = this.config.ENDPOINT;
			doc[request].request = request;

			return new Request(doc[request]);
		});
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
}

module.exports = RequestList;
