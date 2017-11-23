const RequestList = require('../requestList');

describe('RequestList', () => {
	let host = 'http://martianwabbit.com';
	let doc = {
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


	it('should load valid requests', () => {
		let requests = new RequestList(doc, { HOST: host });
		let request = requests.list[0];

		expect(requests.list.length).toBe(3);
		expect(request.VERB).toBe('POST');
		expect(request.ENDPOINT).toBe(host + '/session');
	});
});
