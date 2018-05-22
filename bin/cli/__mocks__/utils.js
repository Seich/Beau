const Beau = require('../../../src/beau');
const original = require.requireActual('../utils');

const utils = {};

const config = {
	environment: {
		params: {
			name: 'David'
		}
	},
	endpoint: 'https://httpbin.org/',
	version: 1,
	'GET /anything': {
		alias: 'anything',
		payload: {
			name: '$env.params.name'
		}
	},
	'GET /status/418': {
		alias: 'teapot'
	}
};

utils.loadConfig = function() {
	return new Beau(config, {});
};

utils.baseFlags = original.baseFlags;

module.exports = utils;
