const yaml = require('js-yaml');
const Beau = require('../beau');

const requireg = require('requireg');
requireg.resolving = false;

describe(`Beau's config Loader.`, () => {
    it('should create a request list', () => {
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

        expect(beau.requests).toBeDefined();
        expect(beau).toMatchSnapshot();
    });
});
