const yaml = require('js-yaml');
const Config = require('../config');

describe('Config', () => {
  it('should load valid config keys', () => {
    const doc = yaml.safeLoad(`
            version: 1
            endpoint: http://martianwabbit.com
            cache: false
            shouldntBeAdded: true
        `);

    const config = new Config(doc);
    expect(config.ENDPOINT).toBe(doc.endpoint);
    expect(config.CACHE).toBe(doc.cache);
    expect(config.VERSION).toBe(doc.version);
    expect(config.shouldntBeAdded).toBeUndefined();
  });

  it('should load requests', () => {
    const doc = yaml.safeLoad(`
            endpoint: http://example.com

            GET /profile: get-profile
            GET /posts: get-posts
            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `);

    const config = new Config(doc);
    expect(Object.keys(config.requests).length).toBe(4);
  });

  it('should set up defaults for all requests', () => {
    const doc = yaml.safeLoad(`
            version: 1
            endpoint: 'http://jsonplaceholder.typicode.com'

            defaults:
                HEADERS:
                    authentication: hello

            GET /posts/1: get-post
            GET /user:
                alias: user
                headers:
                    hello: world
        `);

    const config = new Config(doc);

    expect(config).toMatchSnapshot();
    Object.values(config.requests).forEach(r => {
      expect(r.HEADERS.authentication).toMatch('hello');
    });
  });

  it('should load multiple hosts', () => {
    const doc = yaml.safeLoad(`
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
        `);

    let config = new Config(doc);

    expect(config).toMatchSnapshot();
  });

  it('should namespace all aliases within an host', () => {
    const doc = yaml.safeLoad(`
            hosts:
              - host: test1
                endpoint: http://example.com
                GET /posts: posts
              - host: test2
                endpoint: http://example.net
                GET /posts: posts
        `);

    let config = new Config(doc);

    expect(config.requests[0].ALIAS).toBe('test1:posts');
    expect(config.requests[1].ALIAS).toBe('test2:posts');
  });

  it(`should throw if host doesn't have a host key`, () => {
    const doc = yaml.safeLoad(`
            hosts:
              - endpoint: http://example.com
                GET /posts: posts

              - host: test2
                endpoint: http://example.net
                GET /posts: posts
        `);

    expect(() => new Config(doc)).toThrow();
  });

  it(`should merge host settings with global settings`, () => {
    const doc = yaml.safeLoad(`
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
        `);

    let config = new Config(doc);
    expect(config.requests[0].HEADERS.hello).toBe(1);
  });
});
