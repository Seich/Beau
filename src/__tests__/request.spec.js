const Request = require('../request');
const RequestCache = require('../requestCache');
const RequestList = require('../requestList');
const requestPromiseNativeMock = require('request-promise-native');

describe('Request', () => {
	let cache;
	let validRequestConfig;
	let invalidRequestConfig;
	let request;
	let requestWithoutDependencies;

	beforeEach(() => {
		validRequestConfig = {
			request: 'POST /user',
			endpoint: 'http://martianwabbit.com',
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
		};

		invalidRequestConfig = {
			request: `POST /session`,
			endpoint: 'http://martianwabbit.com'
		};

		cache = new RequestCache();
		cache.add('$session', { token: 'abc123' });
		cache.add('$profile', { UserId: 14 });

		request = new Request(validRequestConfig);
		requestWithoutDependencies = new Request({
			endpoint: 'http://martianwabbit.com',
			request: 'GET /user',
			alias: 'show'
		});

		requestPromiseNativeMock.fail = false;
	});

	it('should load up the given request', () => {
		expect(request.VERB).toBe('POST');
		expect(request.ENDPOINT).toBe(validRequestConfig.endpoint + '/user');
		expect(request.HEADERS).toBeDefined();
		expect(request.PAYLOAD).toBeDefined();
		expect(request.PARAMS).toBeDefined();
	});

	it('should throw if a given request is invalid', () => {
		expect(() => new Request(invalidRequestConfig)).toThrow();
	});

	it('should list all of its dependencies', () => {
		expect(request.DEPENDENCIES.size).toBe(2);
		expect(request.DEPENDENCIES).toContain('session');
		expect(request.DEPENDENCIES).toContain('profile');
	});

	it('should execute a request', async () => {
		await expect(request.exec(cache)).resolves.toMatchSnapshot();
		await expect(
			requestWithoutDependencies.exec()
		).resolves.toMatchSnapshot();
	});

	it('should throw if the request fails', async () => {
		requestPromiseNativeMock.fail = true;
		await expect(requestWithoutDependencies.exec()).rejects.toThrow(Error);
	});
});
