const yaml = require('js-yaml')
const Beau = require('../beau')
const { moduleVersion } = require('../shared')

jest.mock('../shared')

const requireg = require('requireg')
requireg.resolving = false

describe(`Beau's config Loader.`, () => {
    it('should load the config', () => {
        moduleVersion.mockReturnValue(1)

        const doc = yaml.load(`
            version: 1
            endpoint: 'http://example.com'

            defaults:
                headers:
                    authentication: hello
        `)

        const beau = new Beau(doc)
        expect(beau).toMatchSnapshot()
    })

    it(`should load the request list using the configuration`, () => {
        moduleVersion.mockReturnValue(1)

        const doc = yaml.load(`
            version: 1
            endpoint: 'http://example.com'

            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `)

        const beau = new Beau(doc)
        expect(beau.requests).toMatchSnapshot()
    })

    it('should display a warning if the module version and the beau file version are different', () => {
        let stdout
        let spy = jest
            .spyOn(console, 'warn')
            .mockImplementation((val) => (stdout = val))

        moduleVersion.mockReturnValue(2)

        const beau = new Beau({ version: 1 })
        expect(stdout).toEqual('This Beau file expects v1. You are using v2.')

        spy.mockReset()
        spy.mockRestore()
    })
})
