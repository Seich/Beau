const request = require('request-promise-native');
const RequestCache = require('./requestCache');
const Plugins = require('./plugins');

const {
    requestRegex,
    replacementRegex,
    UpperCaseKeys,
    removeOptionalKeys
} = require('./shared');

class Request {
    constructor(req, plugins = new Plugins()) {
        this.originalRequest = req;
        this.plugins = plugins;

        this.loadCofiguration(
            [
                'REQUEST',
                'ENDPOINT',
                'HEADERS',
                'PAYLOAD',
                'PARAMS',
                'FORM',
                'ALIAS',
                'COOKIEJAR',
                'FORMDATA'
            ],
            req
        );

        if (!this.ALIAS) {
            throw new Error(`${this.REQUEST} is missing an alias.`);
        }

        const { VERB, PATH } = this.parseRequest(this.REQUEST);

        this.VERB = VERB;
        this.PATH = PATH;

        this.DEPENDENCIES = this.findDependencies(req);
    }

    loadCofiguration(keys, obj) {
        obj = UpperCaseKeys(obj);
        keys.forEach(k => {
            this[k] = obj[k];
        });
    }

    parseRequest(request) {
        const parts = request.match(requestRegex);

        return {
            VERB: parts[1],
            PATH: parts[2]
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
            formData: this.FORMDATA,

            json: true,
            simple: false,
            resolveWithFullResponse: true
        });

        settings = removeOptionalKeys(settings, [
            'headers',
            'qs',
            'body',
            'form',
            'formData'
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
