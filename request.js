const unirest = require('unirest');
const {httpVerbs, requestRegex, replacementRegex} = require('./shared');
const RequestList = require('./requestList');
const RequestCache = require('./requestCache');

class Request {
	constructor(req) {
		let { request, ALIAS, PAYLOAD, HOST, PARAMS, HEADERS } = req;
		let { verb, endpoint } = this.parseRequest(request);

		this.$verb = verb;
		this.$endpoint = HOST + endpoint;

		this.$headers = HEADERS;
		this.$payload = PAYLOAD;
		this.$params = PARAMS;

		this.$alias = ALIAS;
		this.$dependencies = this.findDependencies(req);
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
				if (key === 'ALIAS' || key.startsWith('$'))
					return;

				set = this.findDependencies(request[key], set);
			});
		} else if (typeof request === 'string') {
			let matches = request.match(replacementRegex) || [];
			let deps = matches.map(m => m.split('.')[0]);

			return new Set([...set, ...deps]);
		}

		return set;
	}

	exec(list = new RequestList(), cache = new RequestCache()) {
		let dependencies = [];

		if (this.$dependencies.size > 0) {
			dependencies = Array.from(this.$dependencies).map(dep => {
				return list.execByAlias(dep);
			});
		}

		return Promise.all(dependencies).then(() => {
			let endpoint = cache.parse(this.$endpoint);
			let request = unirest(this.$verb, endpoint);

			request.headers(cache.safely(this.$headers));
			request.query(cache.safely(this.$params));
			request.send(cache.safely(this.$payload));

			return new Promise((resolve, reject) => {
				request.end(res => {
					let results = {
						request: {
							headers: res.request.headers,
							body: res.request.body,
							endpoint: endpoint
						},
						response: {
							status: res.status,
							headers: res.headers,
							body: res.body,
						}
					};


					if (typeof this.$alias !== 'undefined') {
						cache.add(this.$alias, results);
					}

					resolve(results);
				});
			});
		});
	}
}

module.exports = Request;
