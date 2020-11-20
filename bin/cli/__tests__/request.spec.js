const RequestCommand = require('../commands/request');
const requestPromiseNativeMock = require('request-promise-native');

jest.mock('../../../src/shared');

jest.mock('../base');

describe('Request Command', () => {
    let result;

    beforeEach(() => {
        requestPromiseNativeMock.fail = false;
        result = [];
        jest.spyOn(process.stdout, 'write').mockImplementation(val =>
            result.push(require('strip-ansi')(val.toString('utf8')))
        );
    });

    afterEach(() => jest.restoreAllMocks());

    test.each([
        ['alias'],
        ['alias', '--verbose'],
        ['alias', '--as-json'],
        ['alias', '--as-json', '--verbose'],
        ['alias', '--no-format'],
        ['alias', '--quiet']
    ])('with flags: %s %s %s', async (...args) => {
        await RequestCommand.run(args);
        expect(result).toMatchSnapshot();
    });

    it('should throw an error when the request fails', async () => {
        requestPromiseNativeMock.fail = true;
        await expect(RequestCommand.run(['anything'])).rejects.toThrow(Error);
    });
});
