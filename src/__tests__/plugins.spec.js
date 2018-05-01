const yaml = require('js-yaml');
const Config = require('../config');
const Plugins = require('../plugins');
const Request = require('../request');
const RequestCache = require('../requestCache');

describe(`Beau's plugin system`, () => {
    let config;
    let request;
    let plugins;

    beforeEach(() => {
        const doc = yaml.safeLoad(`
            version: 1
            endpoint: 'http://example.com'

            plugins:
                - Modifiers:
                    data: hi
                - DynamicValues

            GET /posts/$[add(1, 1)]: get-post
        `);

        config = new Config(doc);
        plugins = config.PLUGINS;
    });

    it('should load all plugins', () => {
        expect(plugins.registry.preRequestModifiers.length).toBe(1);
        expect(plugins.registry.postRequestModifiers.length).toBe(1);
        expect(plugins.registry.dynamicValues.length).toBe(1);
    });

    it(`should throw if given an invalid configuration`, () => {
        expect(() => new Plugins([{ test1: true, test2: true }])).toThrow();
    });

    it(`shouldn't do anything when given an empty array.`, () => {
        expect(new Plugins()).toMatchSnapshot();
    });

    describe(`Request Modifiers`, () => {
        beforeEach(() => {
            request = new Request(
                {
                    request: 'POST /user',
                    endpoint: 'http://example.com',
                    alias: 'update'
                },
                plugins
            );
        });

        it(`should modify the request and response using modifiers.`, async () => {
            await expect(request.exec()).resolves.toMatchSnapshot();
        });
    });

    describe(`Dynamic Values`, () => {
        beforeEach(() => {
            request = new Request(
                {
                    request: 'PATCH /hello/$[add(1, 2)]',
                    endpoint: 'http://example.com',
                    alias: 'say-hello',
                    headers: {
                        count: '$[add(1, $value2)]',
                        empty: ''
                    },
                    payload: 'counted $[add(1, $value2)] so far.'
                },
                plugins
            );
        });

        let cache = new RequestCache();
        cache.add('value2', '2');

        it(`should look for dynamic values executing and replacing them`, async () => {
            let req = await request.exec(cache);
            expect(req).toHaveProperty('request.body', 'counted 3 so far.');
        });

        it(`should change the internal datatype if the only thing in the value is the dynamic value`, async () => {
            let req = await request.exec(cache);
            expect(req).toHaveProperty('request.headers.count', 3);
        });

        it(`should return empty values as empty`, async () => {
            let req = await request.exec(cache);
            expect(req).toHaveProperty('request.headers.empty', '');
        });

        it(`should throw when calling an undefined dynamic value`, async () => {
            request = new Request({
                request: 'POST /hello/$[notAvailable(1, 2)]',
                alias: 'say-hello'
            });

            await expect(request.exec()).rejects.toThrow();
        });
    });
});
