const Request = require('../request');
const RequestCache = require('../requestCache');
const RequestList = require('../requestList');

describe('Request', () => {
	let req;
	let cache;
	let request;

	beforeEach(() => {
		req = {
			request: 'POST /user',
			host: 'http://martianwabbit.com',
			alias: 'profile',
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
});
