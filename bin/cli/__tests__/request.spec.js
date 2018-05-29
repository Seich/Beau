const RequestCommand = require('../commands/request');
const requestPromiseNativeMock = require('request-promise-native');

jest.mock('../utils');

describe('Request Command', () => {
	let result;

	beforeEach(() => {
		requestPromiseNativeMock.fail = false;
		result = [];
		jest
			.spyOn(process.stdout, 'write')
			.mockImplementation(val =>
				result.push(require('strip-ansi')(val.toString('utf8')))
			);
	});

	afterEach(() => jest.restoreAllMocks());

	test.each([
		['anything'],
		['anything', '--verbose'],
		['anything', '--as-json'],
		['anything', '--as-json', '--verbose'],
		['anything', '--no-format'],
		['anything', '--quiet']
	])('with flags:', async (...args) => {
		await RequestCommand.run(args);
		expect(result).toMatchSnapshot();
	});

	it('should thrown an error when the request fails', async () => {
		requestPromiseNativeMock.fail = true;
		await expect(RequestCommand.run(['anything'])).rejects.toThrow(Error);
	});
});
