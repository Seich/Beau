const Config = require('../config');
const RequestList = require('../requestList');
const requestPromiseNativeMock = require('request-promise-native');

describe('RequestList', () => {
	const endpoint = 'http://martianwabbit.com';

	let env = {
		environmental: true
	};

	const doc = {
		ENDPOINT: endpoint,
		ENVIRONMENT: env,
		PLUGINS: [
			{
				'beau-jwt': {
					data: {
						secret: 'shhh.',
						userId: 412
					}
				}
			},
			'beau-document'
		],
		'GET /post': { alias: 'get-posts' },
		'POST /user': {
			alias: 'user',
			payload: {
				name: 'Sergio',
				lastname: 'Diaz'
			}
		}
	};

	let requests;
	beforeEach(() => {
		requestPromiseNativeMock.fail = false;

		let config = new Config(doc);
		requests = new RequestList(config.requests, config);
	});

	it('should load valid requests', () => {
		expect(requests.list.length).toBe(2);
	});

	it('should fetch dependencies', () => {
		requests.fetchDependencies(['get-posts']);
	});

	it('should load plugins', () => {
		const pluginLessList = new RequestList();
		expect(requests.modifiers.length).toBe(2);
		expect(pluginLessList.modifiers.length).toBe(0);
	});

	it('should execute requests by alias.', async () => {
		await expect(requests.execByAlias('user')).resolves.toMatchSnapshot();
	});

	it('should fail if the request fails', async () => {
		requestPromiseNativeMock.fail = true;
		await expect(requests.execByAlias('user')).rejects.toThrow();
	});

	it('should return a cached result if available', async () => {
		const obj = { test: true };
		requests.cache.add('$test', obj);
		await expect(requests.execByAlias('test')).resolves.toBe(obj);
	});

	it('should fail if the alias is not found', async () => {
		await expect(requests.execByAlias('notAnAlias')).rejects.toThrow();
	});

	it(`should fail if a given request doesn't have an alias`, () => {
		let config = new Config({
			'GET /hello': {
				headers: {
					hello: 1
				}
			}
		});

		expect(() => new RequestList(config.requests, config)).toThrow();
	});
});
