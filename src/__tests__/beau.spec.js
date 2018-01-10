const yaml = require('js-yaml');
const Beau = require('../beau');

describe(`Beau's config Loader.`, () => {
    it('Should only load valid configuration keys', () => {
        const doc = yaml.safeLoad(`
            version: 1
            endpoint: http://martianwabbit.com
            cache: false
            shouldntBeAdded: true
        `);

        const beau = new Beau(doc);

        expect(beau.config.ENDPOINT).toBe(doc.endpoint);
        expect(beau.config.CACHE).toBe(doc.cache);
        expect(beau.config.VERSION).toBe(doc.version);
        expect(beau.config.shouldntBeAdded).toBeUndefined();
    });

    it('should set up defaults for all requests', () => {
        const doc = yaml.safeLoad(`
            version: 1
            endpoint: 'http://jsonplaceholder.typicode.com'

            defaults:
                headers:
                    authentication: hello

            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `);

        const beau = new Beau(doc);

        expect(beau).toMatchSnapshot();
        beau.requests.list.forEach(r => {
            expect(r.HEADERS.authentication).toMatch('hello');
        });
    });
});
