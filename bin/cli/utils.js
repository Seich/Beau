const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Beau = require('../../src/beau');
const { flags } = require('@oclif/command');

const openConfigFile = configFile => {
    if (!fs.existsSync(configFile)) {
        throw new Error(`The config file, ${configFile} was not found.`);
    }

    return yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
};

const loadConfig = (configFile, params = []) => {
    const config = openConfigFile(configFile);
    const env = dotenv.config().parsed || {};
    params = dotenv.parse(params.join('\n'));

    const envParams = { _: Object.assign(env, params) };

    const configFileDir = path.dirname(path.resolve(process.cwd(), configFile));

    process.chdir(configFileDir);

    return new Beau(config, envParams);
};

const baseFlags = {
    config: flags.string({
        char: 'c',
        description: 'The configuration file to be used.',
        default: 'beau.yml'
    }),
    verbose: flags.boolean({
        char: 'V',
        description: `Show all additional information available for a command.`
    }),
    'no-format': flags.boolean({
        description: `Disables color formatting for usage on external tools.`
    })
};

module.exports = {
    openConfigFile,
    loadConfig,
    baseFlags
};
