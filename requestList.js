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

	execByAlias(alias) {
		let request = this.list.find(r => r.ALIAS === alias);

		if (typeof request === 'undefined') {
			return Promise.reject(`${alias} not found among the requests.`);
		}

		return request
			.exec(this.modifiers)
			.then(res => {
				this.modifiers.forEach(mod => {
					if (typeof mod.postResponse !== 'undefined') {
						mod.postResponse(res);
					}
				});

				return res;
			})
			.catch(reason => {
				return Promise
					.reject(`Request: ${request.VERB} ${request.ENDPOINT} FAILED. \n${reason}`);
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

	loadPlugins() {
		if (typeof this.config.PLUGINS === 'undefined') {
			return;
		}

		return this.config.PLUGINS.map(plugin => {
			let name = plugin;
			let settings = null;

			if (typeof plugin === 'object') {
				name = Object.keys(plugin)[0];
				settings = plugin[name];
			}

			return new (requireg(name))(settings)
		});
	}
}

module.exports = RequestList;
