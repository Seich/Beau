import { requestRegex, moduleVersion } from './shared'
import Plugins from './plugins'
import { safeLoad } from 'js-yaml'

const deepmerge = require('deepmerge')

export interface BeauConfig {
    cookiejar?: boolean
    defaults?: RequestObject
    endpoint?: string
    environment?: {
        [key: string]: UObjectString
    }
    host?: string
    plugins?: UObjectString[] | Plugins
    version?: number
    hosts?: BeauConfig[]
}

export interface RequestObject {
    endpoint?: string
    cookiejar?: boolean
    alias?: string
    form?: { [key: string]: any }
    formdata?: { [key: string]: any }
    headers?: { [key: string]: any }
    params?: { [key: string]: any }
    payload?: UObjectString
    request?: string
}

export type RequestConfig = RequestObject | RequestObject[] | string

export type UObjectString = { [key: string]: any } | string

export default class Config implements BeauConfig {
    version = moduleVersion()
    cookiejar = false
    endpoint = ''

    defaults: RequestObject = {}
    plugins: Plugins
    environment = {}
    host?: string = undefined
    hosts: BeauConfig[] = []

    requests: RequestObject[] = []

    constructor(config: BeauConfig) {
        this.version = config.version ?? moduleVersion()
        this.cookiejar = config.cookiejar ?? false
        this.endpoint = config.endpoint ?? ''
        this.defaults = config.defaults ?? {}
        this.environment = config.environment ?? {}
        this.host = config.host ?? undefined
        this.hosts = config.hosts ?? []
        this.plugins = new Plugins()

        if (Array.isArray(config.plugins)) {
            this.plugins = new Plugins(config.plugins)
        }

        this.loadRequests(config)
        this.loadHosts(this.hosts, this)
    }

    loadHosts(hosts: BeauConfig[], rootConfig: Config) {
        hosts.forEach((host) => {
            if (typeof host.host === 'undefined') {
                throw new Error(`Host doesn't indicate it's host name.`)
            }

            host = deepmerge(rootConfig, host)
            host.defaults = deepmerge(rootConfig.defaults, host.defaults)

            this.loadRequests(host)
        })
    }

    loadRequests(host: BeauConfig) {
        Object.entries(host)
            .filter(([key]) => requestRegex.test(key))
            .forEach(([key, rDefinition]: [string, RequestConfig]) => {
                if (Array.isArray(rDefinition)) {
                    rDefinition.forEach((req) =>
                        this.addRequest(key, req, host)
                    )
                } else {
                    this.addRequest(key, rDefinition, host)
                }
            })
    }

    addRequest(
        key: string,
        request: RequestObject | string,
        settings: BeauConfig
    ) {
        if (typeof request === 'string') {
            request = {
                alias: request
            }
        }

        if (settings.host) {
            request.alias = `${settings.host}:${request.alias}`
        }

        request.request = key
        request.cookiejar = this.cookiejar
        request.endpoint = settings.endpoint

        this.requests.push(deepmerge(settings.defaults, request))
    }
}

export function parseBeauConfig(str: string) {
    const doc = safeLoad(str) as BeauConfig
    return doc
}
