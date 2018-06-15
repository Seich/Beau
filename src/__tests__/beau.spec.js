const yaml = require('js-yaml');
const Beau = require('../beau');
const { moduleVersion } = require('../shared');

jest.mock('../shared');

const requireg = require('requireg');
requireg.resolving = false;

describe(`Beau's config Loader.`, () => {
    it('should create a request list', () => {
        moduleVersion.mockReturnValue(1);

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
    });

    it('should display a warning if the module version and the beau file version are different', () => {
        let stdout;
        let spy = jest
            .spyOn(console, 'warn')
            .mockImplementation(val => (stdout = val));

        moduleVersion.mockReturnValue(2);

        const beau = new Beau({ version: 1 });
        expect(stdout).toEqual('This Beau file expects v1. You are using v2.');

        spy.mockReset();
        spy.mockRestore();
    });
});
