const ListCommand = require('../commands/list');
const stripAnsi = require('strip-ansi');

jest.mock('../utils');

describe('List Command', () => {
	let result;

	beforeEach(() => {
		result = [];
		jest
			.spyOn(process.stdout, 'write')
			.mockImplementation(val =>
				result.push(stripAnsi(val.toString('utf8')))
			);
	});

	afterEach(() => jest.restoreAllMocks());

	it('Should list available requests for a given file.', async () => {
		await ListCommand.run([]);
		expect(result).toMatchSnapshot();
	});

	it('Should disable formatting when the flag is active.', async () => {
		await ListCommand.run(['--no-format']);
		expect(result).toMatchSnapshot();
	});
});
