const Request = require('../request');
const RequestCache = require('../requestCache');
const RequestList = require('../requestList');
const requestPromiseNativeMock = require('request-promise-native');

describe('Request', () => {
	let req;
	let cache;
	let request;
	let requestWithoutDependencies;

	beforeEach(() => {
		req = {
			request: 'POST /user',
			host: 'http://martianwabbit.com',
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

		cache = new RequestCache();
		cache.add('$session', { token: 'abc123' });
		cache.add('$profile', { UserId: 14 });

		request = new Request(req);
		requestWithoutDependencies = new Request({
			host: 'http://martianwabbit.com',
			request: 'GET /user',
			alias: 'show'
		});

		requestPromiseNativeMock.fail = false;
	});

	test('It should load up the given request', () => {
		expect(request.VERB).toBe('POST');
		expect(request.ENDPOINT).toBe(req.host + '/user');
		expect(request.HEADERS).toBeDefined();
		expect(request.PAYLOAD).toBeDefined();
		expect(request.PARAMS).toBeDefined();
	});

	test('It should list all of its dependencies', () => {
		expect(request.DEPENDENCIES.size).toBe(2);
		expect(request.DEPENDENCIES).toContain('session');
		expect(request.DEPENDENCIES).toContain('profile');
	});

	test('It should execute a request', async () => {
		await expect(request.exec([], cache)).resolves.toMatchSnapshot();
		await expect(
			requestWithoutDependencies.exec()
		).resolves.toMatchSnapshot();
	});

	test('It should throw if the request fails', async () => {
		requestPromiseNativeMock.fail = true;
		await expect(requestWithoutDependencies.exec()).rejects.toThrow(Error);
	});

	test('It should use modifiers', async () => {
		const preRequest = jest.fn();
		const withPreRequest = [{ preRequest }];

		const notCalled = jest.fn();
		const nonModifiers = [{ notCalled }];

		await requestWithoutDependencies.exec(withPreRequest);

		expect(preRequest).toHaveBeenCalled();
		expect(preRequest.mock.calls).toMatchSnapshot();

		await requestWithoutDependencies.exec(nonModifiers);

		expect(notCalled).not.toHaveBeenCalled();
	});
});
