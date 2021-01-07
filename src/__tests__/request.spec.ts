import Request from '../request'
import RequestCache from '../requestCache'
const requestPromiseNativeMock = require('request-promise-native')

describe('Request', () => {
    let cache
    let validRequestConfig
    let invalidRequestConfig
    let request
    let requestWithoutDependencies

    beforeEach(() => {
        validRequestConfig = {
            request: 'POST /user',
            endpoint: 'http://example.com',
            alias: 'update',
            params: {
                userId: '$profile.UserId'
            },
            headers: {
                authentication: 'BEARER $session.token'
            },
            payload: {
                username: 'seich'
            }
        }

        invalidRequestConfig = {
            request: `POST /session`,
            endpoint: 'http://example.com'
        }

        cache = new RequestCache()
        cache.add('session', { token: 'abc123' })
        cache.add('profile', { UserId: 14 })

        request = new Request(validRequestConfig)
        requestWithoutDependencies = new Request({
            endpoint: 'http://example.com',
            request: 'GET /user',
            alias: 'show'
        })

        requestPromiseNativeMock.fail = false
    })

    it('should load up the given request', () => {
        expect(request.verb).toBe('POST')
        expect(request.endpoint).toBe(validRequestConfig.endpoint)
        expect(request.headers).toBeDefined()
        expect(request.payload).toBeDefined()
        expect(request.params).toBeDefined()
    })

    it('should throw if a given request is invalid', () => {
        expect(() => new Request(invalidRequestConfig)).toThrow()
    })

    it('should list all of its dependencies', () => {
        expect(request.dependencies.size).toBe(2)
        expect(request.dependencies).toContain('session')
        expect(request.dependencies).toContain('profile')
    })

    it('should execute a request', async () => {
        await expect(request.exec(cache)).resolves.toMatchSnapshot()
        await expect(
            requestWithoutDependencies.exec()
        ).resolves.toMatchSnapshot()
    })

    it('should throw if the request fails', async () => {
        requestPromiseNativeMock.fail = true
        await expect(requestWithoutDependencies.exec()).rejects.toThrow(Error)
    })

    it(`should use the full url if given one as part of the path instead of the global endpoint`, async () => {
        const requestWithPath = new Request({
            endpoint: 'http://example.com',
            request: 'GET http://martianwabbit.com/user',
            alias: 'get-user'
        })

        const requestWithoutPath = new Request({
            endpoint: 'http://example.com',
            request: 'GET /user',
            alias: 'get-user'
        })

        await expect(requestWithPath.exec()).resolves.toHaveProperty(
            'request.endpoint',
            'http://martianwabbit.com/user'
        )

        await expect(requestWithoutPath.exec()).resolves.toHaveProperty(
            'request.endpoint',
            'http://example.com/user'
        )
    })
})
