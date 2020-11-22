import request = require('request-promise-native')
import RequestCache from './requestCache'
import Plugins from './plugins'

import {
    requestRegex,
    replacementRegex,
    removeOptionalKeys,
    isUrl
} from './shared'
import { RequestObject, UObjectString } from './config'

export interface IBeauRequestResult {
    request: {
        headers: { [key: string]: any }
        body: { [key: string]: any } | string
        endpoint: string
    }
    response: {
        status: number
        headers: { [key: string]: any }
        body: { [key: string]: any } | string
    }
    body: { [key: string]: any } | string
}

export default class Request implements RequestObject {
    originalRequest: RequestObject
    plugins: Plugins
    endpoint: string
    cookiejar: boolean
    alias?: string
    form: { [key: string]: any }
    formdata: { [key: string]: any }
    headers: { [key: string]: any }
    params: { [key: string]: any }
    payload: UObjectString
    request: string
    verb: string
    path: string
    dependencies: Set<string>

    constructor(req: RequestObject, plugins = new Plugins()) {
        this.originalRequest = req
        this.plugins = plugins
        this.endpoint = req.endpoint ?? ''
        this.cookiejar = req.cookiejar ?? false
        this.alias = req.alias ?? undefined
        this.form = req.form ?? {}
        this.formdata = req.formdata ?? {}
        this.payload = req.payload ?? {}
        this.headers = req.headers ?? {}
        this.params = req.params ?? {}
        this.request = req.request ?? ''

        if (!this.alias) {
            throw new Error(`${this.request} is missing an alias.`)
        }

        const { verb, path } = this.parseRequest(this.request)

        this.verb = verb
        this.path = path

        this.dependencies = this.findDependencies(req)
    }

    parseRequest(request: string) {
        const parts = request.match(requestRegex)

        if (parts === null) {
            throw new Error('Request path misformed.')
        }

        return {
            verb: parts[1],
            path: parts[2]
        }
    }

    findDependencies(request: RequestObject | string, set = new Set<string>()) {
        if (typeof request === 'object' && request !== null) {
            Object.entries(request)
                .filter(([key]) => key !== 'alias')
                .forEach(([_, value]) => {
                    set = this.findDependencies(value, set)
                })
        } else if (typeof request === 'string') {
            const matches: string[] = []
            request.replace(replacementRegex, (match, g1: any) => {
                if (!match.startsWith('\\')) {
                    matches.push(g1)
                }

                return ''
            })

            const deps = matches.map((m) => m.split('.')[0])

            return new Set([...set, ...deps])
        }

        return set
    }

    async exec(cache = new RequestCache()) {
        let settings = cache.parse({
            baseUrl: '',
            uri: this.path,
            method: this.verb,
            jar: this.cookiejar,

            headers: this.headers,
            qs: this.params,
            body: this.payload,
            form: this.form,
            formData: this.formdata,

            json: true,
            simple: false,
            resolveWithFullResponse: true
        })

        if (typeof settings !== 'object' || settings === null) {
            throw new Error('Error parsing request.')
        }

        const isPathFullUrl = isUrl(settings.uri)
        settings.baseUrl = isPathFullUrl ? '' : this.endpoint

        settings = removeOptionalKeys(settings, [
            'headers',
            'qs',
            'body',
            'form',
            'formData'
        ])

        settings = this.plugins.replaceDynamicValues(settings)

        settings = this.plugins.executeModifier(
            'preRequestModifiers',
            settings,
            this.originalRequest
        )

        const response = await request(settings)

        let results: IBeauRequestResult = {
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
        }

        results = this.plugins.executeModifier(
            'postRequestModifiers',
            results,
            this.originalRequest
        )

        cache.add(this.alias!, results)

        return results
    }
}
