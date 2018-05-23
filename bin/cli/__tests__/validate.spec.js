const ValidateCommand = require('../commands/validate');

jest.mock('../utils');

describe('Validate Command', () => {
	let result;

	beforeEach(() => {
		result = [];
		jest
			.spyOn(process.stdout, 'write')
			.mockImplementation(val =>
				result.push(require('strip-ansi')(val.toString('utf8')))
			);
	});

	afterEach(() => jest.restoreAllMocks());

	it('Validate the configuration file', async () => {
		await ValidateCommand.run([]);
		expect(result).toMatchSnapshot();
	});
});
