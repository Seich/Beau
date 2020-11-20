const Beau = require('../../../src/beau')

const original = jest.requireActual('../base')

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
}

class Base extends original {
    loadConfig(configFile, params = []) {
        return new Beau(config, {})
    }
}

module.exports = Base
