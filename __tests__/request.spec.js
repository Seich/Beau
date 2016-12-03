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
			HOST: 'http://martianwabbit.com',
			PARAMS: {
				userId: '$profile.UserId'
			},
			HEADERS: {
				authentication: 'BEARER $session.token'
			},
			PAYLOAD: {
				username: 'seich'
			}
		};

		cache = new RequestCache();
		cache.add('$session', { token: 'abc123' });
		cache.add('$profile', { UserId: 14 });

		request = new Request(req);
	});

	test('It should load up the given request', () => {
		expect(request.$verb).toBe('POST');
		expect(request.$endpoint).toBe(req.HOST + '/user');
		expect(request.$headers).toBeDefined();
		expect(request.$payload).toBeDefined();
		expect(request.$params).toBeDefined();
	});

	test('It should list all of its dependencies', () => {
		expect(request.$dependencies.size).toBe(2);
		expect(request.$dependencies).toContain('$session');
		expect(request.$dependencies).toContain('$profile');
	});
});
