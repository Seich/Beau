const request = require('request-promise-native');
const {httpVerbs, requestRegex, replacementRegex} = require('./shared');
const RequestList = require('./requestList');
const RequestCache = require('./requestCache');

class Request {
	constructor(req, list) {
		let config = {};
		this.originalRequest = req;

		Object.keys(req).forEach(k => config[k.toUpperCase()] = req[k]);

		let { REQUEST, ALIAS, PAYLOAD, HOST, PARAMS, HEADERS, DOCUMENTATION } = config;
		let { verb, endpoint } = this.parseRequest(REQUEST);

		this.VERB = verb;
		this.ENDPOINT = HOST + endpoint;

		this.HEADERS = HEADERS;
		this.PAYLOAD = PAYLOAD;
		this.PARAMS = PARAMS;

		this.ALIAS = ALIAS;
		this.DEPENDENCIES = this.findDependencies(req);

		this.DOCUMENTATION = DOCUMENTATION;

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
			let keys = Object.keys(request).filter(key => key !== 'ALIAS');

			keys.forEach(key => {
				set = this.findDependencies(request[key], set);
			});
		} else if (typeof request === 'string') {
			let matches = request.match(replacementRegex) || [];
			let deps = matches.map(m => m.split('.')[0].substring(1));

			return new Set([...set, ...deps]);
		}

		return set;
	}

	async exec(modifiers = []) {
		let dependencies = Array.from(this.DEPENDENCIES);

		let cache = await this.list.fetchDependencies(dependencies);

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

		try {
			let response = await request({
				url: settings.endpoint,
				method: settings.method,
				headers: settings.headers,
				qs: settings.query,
				body: settings.payload,

				json: true,
				simple: false,
				resolveWithFullResponse: true
			});

			let results = {
				request: {
					headers: response.request.headers,
					body: response.request.body,
					endpoint: response.request.uri.href
				},
				response: {
					status: response.statusCode,
					headers: response.headers,
					body: response.body
				},
				body: response.body
			};

			cache.add(`$${this.ALIAS}`, results);

			return results;
		} catch({error}) {
			throw new Error(error);
		}
	}
}

module.exports = Request;
