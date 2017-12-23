const RequestList = require('../requestList');
const requestPromiseNativeMock = require('request-promise-native');

describe('RequestList', () => {
	const host = 'http://martianwabbit.com';
	const doc = {
		'POST /session': null,
		'Not a Request': null,
		'GET /post': 'get-posts',
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
		requests = new RequestList(doc, {
			HOST: host,
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
			]
		});
	});

	it('should load valid requests', () => {
		const request = requests.list[0];

		expect(requests.list.length).toBe(3);
		expect(request.VERB).toBe('POST');
		expect(request.ENDPOINT).toBe(host + '/session');
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
		await requests.execByAlias('user');
	});

	it('should fail if the request fails', async () => {
		requestPromiseNativeMock.fail = true;
		await expect(requests.execByAlias('user')).rejects.toThrow(Error);
	});

	it('should fail if the alias is not found', async () => {
		await expect(requests.execByAlias('notAnAlias')).rejects.toThrow(Error);
	});
});
