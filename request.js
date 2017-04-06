const unirest = require('unirest');
const {httpVerbs, requestRegex, replacementRegex} = require('./shared');
const RequestList = require('./requestList');
const RequestCache = require('./requestCache');

class Request {
	constructor(req, list) {
		let config = {};
		this.originalRequest = req;

		Object.keys(req).forEach(k => config[k.toUpperCase()] = req[k]);

		let { REQUEST, ALIAS, PAYLOAD, HOST, PARAMS, HEADERS } = config;
		let { verb, endpoint } = this.parseRequest(REQUEST);

		this.VERB = verb;
		this.ENDPOINT = HOST + endpoint;

		this.HEADERS = HEADERS;
		this.PAYLOAD = PAYLOAD;
		this.PARAMS = PARAMS;

		this.ALIAS = ALIAS;
		this.DEPENDENCIES = this.findDependencies(req);

		this.list = list;
	}

	parseRequest(request) {
		let parts = request.match(requestRegex);

		return {
			verb: parts[1],
			endpoint: parts[2]
		};
	}

	findDependencies(request, set = new Set()) {
		if (typeof request === 'object') {
			Object.keys(request).forEach(key => {
				if (key === 'ALIAS')
					return;

				set = this.findDependencies(request[key], set);
			});
		} else if (typeof request === 'string') {
			let matches = request.match(replacementRegex) || [];
			let deps = matches.map(m => m.split('.')[0].substring(1));

			return new Set([...set, ...deps]);
		}

		return set;
	}

	exec(modifiers = []) {
		let dependencies = Array.from(this.DEPENDENCIES);

		return this.list.fetchDependencies(dependencies).then(cache => {
			let settings = {
				endpoint: cache.parse(this.ENDPOINT),
				method: this.VERB,
				headers: cache.parse(this.HEADERS),
				query: cache.parse(this.PARAMS),
				payload: cache.parse(this.PAYLOAD)
			};

			modifiers.forEach(mod => {
				if (typeof mod.preRequest !== 'undefined') {
					mod.preRequest(settings, this.originalRequest);
				}
			});

			let request = unirest(settings.method, settings.endpoint);

			request.headers(settings.headers);
			request.query(settings.query);
			request.send(settings.payload);

			return new Promise((resolve, reject) => {
				request.end(res => {
					if (res.error !== false) {
						let error = typeof res.error.code === 'undefined' ? `Invalid Request ${res.error}` : res.error.code;
						return reject(`HTTP Request failed: ${error}`);
					}

					let results = {
						request: {
							headers: res.request.headers,
							body: res.request.body,
							endpoint: settings.endpoint
						},
						response: {
							status: res.status,
							headers: res.headers,
							body: res.body,
						}
					};

					results.body = results.response.body;

					cache.add(`$${this.ALIAS}`, results);

					return resolve(results);
				});
			});
		});
	}
}

module.exports = Request;
