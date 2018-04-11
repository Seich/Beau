const request = require('request-promise-native');
const RequestList = require('./requestList');
const RequestCache = require('./requestCache');
const Plugins = require('./plugins');

const {
	httpVerbs,
	requestRegex,
	replacementRegex,
	UpperCaseKeys,
	removeOptionalKeys
} = require('./shared');

class Request {
	constructor(req, plugins = new Plugins()) {
		this.originalRequest = req;
		this.plugins = plugins;

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
		let type = typeof request;

		if (type === 'object') {
			Object.keys(request)
				.filter(key => key !== 'ALIAS')
				.forEach(key => {
					set = this.findDependencies(request[key], set);
				});
		} else if (type === 'string') {
			const matches = [];
			request.replace(
				replacementRegex,
				(match, g1) => !match.startsWith('\\') && matches.push(g1)
			);
			const deps = matches.map(m => m.split('.')[0]);

			return new Set([...set, ...deps]);
		}

		return set;
	}

	async exec(cache = new RequestCache()) {
		let settings = cache.parse({
			endpoint: this.ENDPOINT,
			method: this.VERB,
			headers: this.HEADERS,
			query: this.PARAMS,
			payload: this.PAYLOAD
		});

		settings = this.plugins.replaceDynamicValues(settings);

		settings = this.plugins.executeModifier(
			'preRequestModifiers',
			settings,
			this.originalRequest
		);

		try {
			const response = await request(
				removeOptionalKeys(
					{
						url: settings.endpoint,
						method: settings.method,

						headers: settings.headers,
						qs: settings.query,
						body: settings.payload,

						json: true,
						simple: false,
						resolveWithFullResponse: true
					},
					['headers', 'qs', 'body']
				)
			);

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

			results = this.plugins.executeModifier(
				'postRequestModifiers',
				results,
				this.originalRequest
			);

			cache.add(this.ALIAS, results);

			return results;
		} catch ({ error }) {
			throw new Error(`Request Error: ` + error);
		}
	}
}

module.exports = Request;
