const Beau = require('../../../src/beau');
const original = require.requireActual('../utils');

const utils = {};

const config = {
    environment: {
        params: {
            name: 'David'
        }
    },
    endpoint: 'https://example.org',
    version: 1,
    'GET /anything': {
        alias: 'alias',
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

utils.openConfigFile = function(filename) {
    if (filename === 'beau.yml') {
        return config;
    }

    if (filename === 'invalid-conf.yml') {
        return { plugins: [{ hello: 1, world: 2 }] };
    }
};

utils.baseFlags = original.baseFlags;

module.exports = utils;
