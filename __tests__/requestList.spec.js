const RequestList = require('../requestList');

describe('RequestList', () => {
	let host = 'http://martianwabbit.com';
	let doc = {
		'POST /session': null,
		'Not a Request': null,
		'POST /user': {
			ALIAS: '$user',
			PAYLOAD: {
				name: 'Sergio',
				lastname: 'Diaz'
			}
		}
	};


	it('should load valid requests', () => {
		let requests = new RequestList(doc, { HOST: host });
		let request = requests.list[0];

		expect(requests.list.length).toBe(2);
		expect(request.$verb).toBe('POST');
		expect(request.$endpoint).toBe(host + '/session');
	});
});
