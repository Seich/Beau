const got = require('got')
const FormData = require('form-data')
const { CookieJar } = require('tough-cookie')
const RequestCache = require('./requestCache')
const Plugins = require('./plugins')

const {
    requestRegex,
    replacementRegex,
    UpperCaseKeys,
    removeOptionalKeys,
    isUrl
} = require('./shared')

class Request {
    constructor(req, plugins = new Plugins()) {
        this.originalRequest = req
        this.plugins = plugins

        req = UpperCaseKeys(req)
        Object.assign(this, req)

        if (!this.ALIAS) {
            throw new Error(`${this.REQUEST} is missing an alias.`)
        }

        const { VERB, PATH } = this.parseRequest(this.REQUEST)

        this.VERB = VERB
        this.PATH = PATH

        this.DEPENDENCIES = this.findDependencies(req)
    }

    parseRequest(request) {
        const parts = request.match(requestRegex)

        return {
            VERB: parts[1],
            PATH: parts[2]
        }
    }

    findDependencies(request, set = new Set()) {
        let type = typeof request

        if (type === 'object' && request !== null) {
            Object.entries(request)
                .filter(([key]) => key !== 'ALIAS')
                .forEach(([key, value]) => {
                    set = this.findDependencies(value, set)
                })
        } else if (type === 'string') {
            const matches = []
            request.replace(
                replacementRegex,
                (match, g1) => !match.startsWith('\\') && matches.push(g1)
            )

            const deps = matches.map((m) => m.split('.')[0])

            return new Set([...set, ...deps])
        }

        return set
    }

    async exec(cache = new RequestCache()) {
        let settings = cache.parse({
            url: this.PATH,
            method: this.VERB,

            headers: this.HEADERS,
            searchParams: this.PARAMS,
            body: this.PAYLOAD,
            form: this.FORM,
            formData: this.FORMDATA,

            throwHttpErrors: false,
            responseType: 'json',
            allowGetBody: true
        })

        if (!isUrl(settings.url)) {
            settings.url =
                this.ENDPOINT.replace(/\/+$/, '') +
                '/' +
                settings.url.replace(/^\/+/, '')
        }

        if (typeof settings.body === 'object') {
            settings.json = settings.body
            settings.body = {}
        }

        settings = removeOptionalKeys(settings, [
            'headers',
            'searchParams',
            'body',
            'form',
            'formData',
            'json'
        ])

        settings = this.plugins.replaceDynamicValues(settings)

        settings = this.plugins.executeModifier(
            'preRequestModifiers',
            settings,
            this.originalRequest
        )

        if (typeof settings.formData === 'object') {
            const formdata = new FormData()
            Object.keys(settings.formData).forEach((key) =>
                formdata.append(key, settings.formData[key])
            )

            settings.body = formdata
        }

        if (this.COOKIEJAR) {
            settings.cookiejar = new CookieJar()
        }

        console.log(settings)

        const response = await got(settings)

        let results = {
            request: {
                headers: response.request.headers,
                body: response.request.body,
                endpoint: response.request.requestUrl
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

        cache.add(this.ALIAS, results)

        return results
    }
}

module.exports = Request
