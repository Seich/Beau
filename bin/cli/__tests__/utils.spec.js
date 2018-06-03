const utils = require('../utils.js');

jest.mock('fs');

describe('utils', () => {
    describe('openConfigFile', () => {
        it('should read and parse the given configuration file.', () => {
            expect(utils.openConfigFile('beau.yml')).toMatchSnapshot();
        });

        it('should throw if given not given a file', () => {
            expect(() => utils.openConfigFile('not-a-file.yml')).toThrow();
        });
    });

    describe('loadConfig', () => {
        it('should load load the config onto Beau', () => {
            let beau = utils.loadConfig('beau.yml');
            expect(beau.config).toMatchSnapshot();
        });

        it('should load params onto the environment', () => {
            let beau = utils.loadConfig('beau.yml', [
                'HELLO=WORLD',
                'BYE=MARS'
            ]);
            expect(beau.config.ENVIRONMENT).toMatchSnapshot();
        });
    });
});
