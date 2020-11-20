const deepMerge = require('deepmerge')
const { requestRegex, UpperCaseKeys, moduleVersion } = require('./shared')
const Plugins = require('./plugins')

class Config {
    constructor(doc, env = {}) {
        const defaultConfigValues = {
            VERSION: moduleVersion(),
            ENDPOINT: '',
            PLUGINS: [],
            DEFAULTS: {},
            ENVIRONMENT: {},
            HOSTS: [],
            COOKIEJAR: false
        }

        this.configKeys = Object.keys(defaultConfigValues)

        let config = this.loadConfig(doc)
        Object.assign(this, defaultConfigValues, config)

        this.ENVIRONMENT = deepMerge(this.ENVIRONMENT, env)

        this.REQUESTS = []

        this.loadRequests(doc, {
            DEFAULTS: this.DEFAULTS,
            ENDPOINT: this.ENDPOINT
        })

        this.loadHosts(this.HOSTS, config, defaultConfigValues)

        this.PLUGINS = new Plugins(this.PLUGINS)
    }

    loadHosts(hosts, rootConfig, defaultConfigValues) {
        hosts.forEach((host) => {
            if (typeof host.host === 'undefined') {
                throw new Error(`Host doesn't indicate it's host name.`)
            }

            let config = deepMerge(defaultConfigValues, this.loadConfig(host))

            config.DEFAULTS = deepMerge(rootConfig.DEFAULTS, config.DEFAULTS)

            this.loadRequests(host, {
                DEFAULTS: config.DEFAULTS,
                ENDPOINT: config.ENDPOINT,
                NAMESPACE: host.host
            })
        })
    }

    loadRequests(host, settings) {
        Object.entries(host)
            .filter(([key]) => requestRegex.test(key))
            .forEach(([key, rDefinition]) => {
                if (Array.isArray(rDefinition)) {
                    rDefinition.forEach((req) =>
                        this.addRequest(key, req, settings)
                    )
                } else {
                    this.addRequest(key, rDefinition, settings)
                }
            })
    }

    addRequest(key, rDefinition, settings) {
        let requestDefinitionIsString = typeof rDefinition === 'string'
        let originalRequest = requestDefinitionIsString
            ? { ALIAS: rDefinition }
            : rDefinition

        let request = UpperCaseKeys(originalRequest)

        if (settings.NAMESPACE) {
            request.ALIAS = `${settings.NAMESPACE}:${request.ALIAS}`
        }

        request.REQUEST = key
        request.COOKIEJAR = this.COOKIEJAR
        request.ENDPOINT = settings.ENDPOINT

        let defaults = UpperCaseKeys(settings.DEFAULTS)

        this.REQUESTS.push(deepMerge(defaults, request))
    }

    loadConfig(host) {
        let config = {}

        Object.entries(host)
            .filter(([key]) => this.configKeys.includes(key.toUpperCase()))
            .forEach(([key, value]) => (config[key.toUpperCase()] = value))

        return config
    }
}

module.exports = Config
