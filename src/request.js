const request = require('request-promise-native');
const {
	httpVerbs,
	requestRegex,
	replacementRegex,
	UpperCaseKeys
} = require('./shared');
const RequestList = require('./requestList');
const RequestCache = require('./requestCache');

class Request {
	constructor(req) {
		this.originalRequest = req;

		const {
			REQUEST,
			ALIAS,
			PAYLOAD,
			ENDPOINT,
			PARAMS,
			HEADERS
		} = UpperCaseKeys(req);

		if (!ALIAS) {
			throw new Error(`${REQUEST} is missing an alias.`);
		}

		const { verb, path } = this.parseRequest(REQUEST);

		this.VERB = verb;
		this.ENDPOINT = ENDPOINT + path;

		this.HEADERS = HEADERS;
		this.PAYLOAD = PAYLOAD;
		this.PARAMS = PARAMS;

		this.ALIAS = ALIAS;

		this.DEPENDENCIES = this.findDependencies(req);
	}

	parseRequest(request) {
		const parts = request.match(requestRegex);

		return {
			verb: parts[1],
			path: parts[2]
		};
	}

	findDependencies(request, set = new Set()) {
		if (typeof request === 'object') {
			const keys = Object.keys(request).filter(key => key !== 'ALIAS');

			keys.forEach(key => {
				set = this.findDependencies(request[key], set);
			});
		} else if (typeof request === 'string') {
			const matches = request.match(replacementRegex) || [];
			const deps = matches.map(m => m.split('.')[0].substring(1));

			return new Set([...set, ...deps]);
		}

		return set;
	}

	async exec(modifiers = [], cache = new RequestCache()) {
		const settings = {
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
			const response = await request({
				url: settings.endpoint,
				method: settings.method,
				headers: settings.headers,
				qs: settings.query,
				body: settings.payload,

				json: true,
				simple: false,
				resolveWithFullResponse: true
			});

			const results = {
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
		} catch ({ error }) {
			throw new Error(error);
		}
	}
}

module.exports = Request;
