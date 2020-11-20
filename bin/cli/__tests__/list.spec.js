const ListCommand = require('../commands/list')

jest.mock('../../../src/shared')

jest.mock('../base')

describe('List Command', () => {
    let result

    beforeEach(() => {
        result = []
        jest.spyOn(process.stdout, 'write').mockImplementation((val) =>
            result.push(require('strip-ansi')(val.toString('utf8')))
        )
    })

    afterEach(() => jest.restoreAllMocks())

    test.each([[], ['--no-format']])('with flags:', async (...args) => {
        await ListCommand.run(args)
        expect(result).toMatchSnapshot()
    })
})
