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

	it('Should request the given alias', async () => {
		await RequestCommand.run(['anything']);
		expect(result).toMatchSnapshot();
	});

	it('Should show all information available when being verbose', async () => {
		await RequestCommand.run(['anything', '--verbose']);
		expect(result).toMatchSnapshot();
	});

	it('Should output the response as json', async () => {
		await RequestCommand.run(['anything', '--as-json']);
		expect(result).toMatchSnapshot();
	});

	it('Should output the response as json verboselly', async () => {
		await RequestCommand.run(['anything', '--as-json', '--verbose']);
		expect(result).toMatchSnapshot();
	});

	it('Should output an unformatted version', async () => {
		await RequestCommand.run(['anything', '--no-format']);
		expect(result).toMatchSnapshot();
	});

	it('Should output nothing', async () => {
		await RequestCommand.run(['anything', '--quiet']);
		expect(result).toMatchSnapshot();
	});

	it('should thrown an error when the request fails', async () => {
		requestPromiseNativeMock.fail = true;
		await expect(RequestCommand.run(['anything'])).rejects.toThrow(Error);
	});
});
