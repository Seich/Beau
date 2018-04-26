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
			HEADERS,
			FORM,
			COOKIEJAR
		} = UpperCaseKeys(req);

		if (!ALIAS) {
			throw new Error(`${REQUEST} is missing an alias.`);
		}

		const { verb, path } = this.parseRequest(REQUEST);

		this.VERB = verb;
		this.ENDPOINT = ENDPOINT;
		this.PATH = path;

		this.HEADERS = HEADERS;
		this.PAYLOAD = PAYLOAD;
		this.PARAMS = PARAMS;
		this.FORM = FORM;

		this.ALIAS = ALIAS;
		this.COOKIEJAR = COOKIEJAR;

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
			baseUrl: this.ENDPOINT,
			uri: this.PATH,
			method: this.VERB,
			jar: this.COOKIEJAR,

			headers: this.HEADERS,
			qs: this.PARAMS,
			body: this.PAYLOAD,
			form: this.FORM,

			json: true,
			simple: false,
			resolveWithFullResponse: true
		});

		settings = removeOptionalKeys(settings, [
			'headers',
			'qs',
			'body',
			'form'
		]);

		settings = this.plugins.replaceDynamicValues(settings);

		settings = this.plugins.executeModifier(
			'preRequestModifiers',
			settings,
			this.originalRequest
		);

		try {
			const response = await request(settings);

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
