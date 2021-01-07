import Beau from '../beau'
import { parseBeauConfig } from '../config'
const shared = require('../shared')

const requireg = require('requireg')
requireg.resolving = false

shared.moduleVersion = jest.fn().mockReturnValue(1)

describe(`Beau's config Loader`, () => {
    it('should load the config', () => {
        const doc = parseBeauConfig(`
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
        const doc = parseBeauConfig(`
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

        shared.moduleVersion.mockReturnValue(2)

        new Beau({ version: 1 })
        expect(stdout).toEqual('This Beau file expects v1. You are using v2.')

        spy.mockReset()
        spy.mockRestore()
    })
})
