const deepMerge = require('deepmerge');
const { requestRegex, UpperCaseKeys } = require('./shared');
const Plugins = require('./plugins');

class Config {
	constructor(doc, env = {}) {
		this.defaultConfigValues = {
			VERSION: 1,
			CACHE: false,
			ENDPOINT: '',
			PLUGINS: [],
			DEFAULTS: {},
			ENVIRONMENT: {},
			HOSTS: []
		};

		this.configKeys = Object.keys(this.defaultConfigValues);
		this.doc = doc;

		let config = this.loadConfig(doc);
		this.configKeys.forEach(k => {
			this[k] = config[k] || this.defaultConfigValues[k];
		});

		this.ENVIRONMENT = deepMerge(this.ENVIRONMENT, env);

		this.REQUESTS = [];

		this.loadRequests(doc, {
			DEFAULTS: this.DEFAULTS,
			ENDPOINT: this.ENDPOINT
		});

		this.loadHosts(this.HOSTS, config);

		this.PLUGINS = new Plugins(this.PLUGINS);
	}

	loadHosts(hosts, rootConfig) {
		hosts.forEach(host => {
			if (typeof host.host === 'undefined') {
				throw new Error(`Host doesn't indicate it's host name.`);
			}

			let config = deepMerge(
				this.defaultConfigValues,
				this.loadConfig(host)
			);

			config.DEFAULTS = deepMerge(rootConfig.DEFAULTS, config.DEFAULTS);

			this.loadRequests(host, {
				DEFAULTS: config.DEFAULTS,
				ENDPOINT: config.ENDPOINT,
				NAMESPACE: host.host
			});
		});
	}

	loadRequests(host, settings) {
		let requests = Object.keys(host)
			.filter(key => requestRegex.test(key))
			.map(key => {
				let requestDefinitionIsString = typeof host[key] === 'string';
				let originalRequest = requestDefinitionIsString
					? { ALIAS: host[key] }
					: deepMerge.all([host[key]]);

				let request = UpperCaseKeys(originalRequest);

				if (settings.NAMESPACE) {
					request.ALIAS = `${settings.NAMESPACE}:${request.ALIAS}`;
				}

				request.REQUEST = key;
				request.ENDPOINT = settings.ENDPOINT;

				let defaults = UpperCaseKeys(settings.DEFAULTS);

				return deepMerge(defaults, request);
			});

		this.REQUESTS = this.REQUESTS.concat(requests);
	}

	loadConfig(host) {
		let config = {};

		Object.keys(host)
			.filter(k => this.configKeys.includes(k.toUpperCase()))
			.forEach(k => (config[k.toUpperCase()] = host[k]));

		return config;
	}
}

module.exports = Config;
