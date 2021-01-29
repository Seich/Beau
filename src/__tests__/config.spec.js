const yaml = require('js-yaml')
const Config = require('../config')

const requireg = require('requireg')
requireg.resolving = false

describe('Config', () => {
    it('should load valid config keys', () => {
        const doc = yaml.load(`
            version: 1
            endpoint: http://martianwabbit.com
            shouldntBeAdded: true
        `)

        const config = new Config(doc)
        expect(config.ENDPOINT).toBe(doc.endpoint)
        expect(config.VERSION).toBe(doc.version)
        expect(config.shouldntBeAdded).toBeUndefined()
    })

    it('should load requests', () => {
        const doc = yaml.load(`
            endpoint: http://example.com

            GET /profile: get-profile
            GET /posts: get-posts
            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `)

        const config = new Config(doc)
        expect(Object.keys(config.REQUESTS).length).toBe(4)
    })

    it('should set up defaults for all requests', () => {
        const doc = yaml.load(`
            version: 1
            endpoint: 'http://example.com'

            defaults:
                HEADERS:
                    authentication: hello

            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `)

        const config = new Config(doc)

        expect(config).toMatchSnapshot()
        Object.values(config.REQUESTS).forEach((r) => {
            expect(r.HEADERS.authentication).toMatch('hello')
        })
    })

    it('should load multiple hosts', () => {
        const doc = yaml.load(`
          version: 1
          endpoint: http://example.org

          defaults:
            HEADERS:
              hello: mars

          GET /e1: e1

          hosts:
            - host: com
              endpoint: http://example.com

              defaults:
                HEADERS:
                  hello: world
                  world: hello

              GET /e2: e2
              GET /posts: posts

            - host: net
              endpoint: http://example.net

              defaults:
                HEADERS:
                  hello: world
                  world: bye

              GET /e3: e3
              GET /posts: posts

            - host: info
              endpoint: http://example.info

              GET /posts: posts
        `)

        let config = new Config(doc)

        expect(config).toMatchSnapshot()
    })

    it('should namespace all aliases within an host', () => {
        const doc = yaml.load(`
            hosts:
              - host: test1
                endpoint: http://example.com
                GET /posts: posts
              - host: test2
                endpoint: http://example.net
                GET /posts: posts
        `)

        let config = new Config(doc)

        expect(config.REQUESTS[0].ALIAS).toBe('test1:posts')
        expect(config.REQUESTS[1].ALIAS).toBe('test2:posts')
    })

    it(`should throw if host doesn't have a host key`, () => {
        const doc = yaml.load(`
            hosts:
              - endpoint: http://example.com
                GET /posts: posts

              - host: test2
                endpoint: http://example.net
                GET /posts: posts
        `)

        expect(() => new Config(doc)).toThrow()
    })

    it(`should merge host settings with global settings`, () => {
        const doc = yaml.load(`
            defaults:
              headers:
                hello: 1

            hosts:
              - host: test
                endpoint: http://example.net
                GET /posts: posts

              - host: test2
                endpoint: http://example.org
                defaults:
                  headers: false

                GET /posts: posts
        `)

        let config = new Config(doc)
        expect(config.REQUESTS[0].HEADERS.hello).toBe(1)
    })

    it(`should allow different settings for the same request`, () => {
        const doc = yaml.load(`
      host: https://example.com
      GET /1:
        - alias: req1
          headers:
            request: 1
        - alias: req2
          headers:
            request: 2
    `)

        let config = new Config(doc)
        expect(config.REQUESTS.length).toBe(2)
    })
})
