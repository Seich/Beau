import Config, { parseBeauConfig } from '../config'

const requireg = require('requireg')
requireg.resolving = false

describe('Config', () => {
    it('should load valid config keys', () => {
        const doc = parseBeauConfig(`
            version: 1
            endpoint: http://martianwabbit.com
            shouldntBeAdded: true
        `)

        const config = new Config(doc)
        expect(config.endpoint).toBe(doc.endpoint)
        expect(config.version).toBe(doc.version)
    })

    it('should load requests', () => {
        const doc = parseBeauConfig(`
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
        expect(Object.keys(config.requests).length).toBe(4)
    })

    it('should set up defaults for all requests', () => {
        const doc = parseBeauConfig(`
            version: 1
            endpoint: 'http://example.com'

            defaults:
                headers:
                    authentication: hello

            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `)

        const config = new Config(doc)

        expect(config).toMatchSnapshot()
        Object.values(config.requests).forEach((r: any) => {
            expect(r.headers.authentication).toMatch('hello')
        })
    })

    it('should load multiple hosts', () => {
        const doc = parseBeauConfig(`
          version: 1
          endpoint: http://example.org

          defaults:
            headers:
              hello: mars

          GET /e1: e1

          hosts:
            - host: com
              endpoint: http://example.com

              defaults:
                headers:
                  hello: world
                  world: hello

              GET /e2: e2
              GET /posts: posts

            - host: net
              endpoint: http://example.net

              defaults:
                headers:
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
        const doc = parseBeauConfig(`
            hosts:
              - host: test1
                endpoint: http://example.com
                GET /posts: posts
              - host: test2
                endpoint: http://example.net
                GET /posts: posts
        `)

        let config = new Config(doc)

        expect(config.requests[0].alias).toEqual('test1:posts')
        expect(config.requests[1].alias).toEqual('test2:posts')
    })

    it(`should throw if host doesn't have a host key`, () => {
        const doc = parseBeauConfig(`
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
        const doc = parseBeauConfig(`
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
        expect(config.requests[0].headers.hello).toBe(1)
    })

    it(`should allow different settings for the same request`, () => {
        const doc = parseBeauConfig(`
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
        expect(config.requests.length).toBe(2)
    })
})
