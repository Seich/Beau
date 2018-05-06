const yaml = require('js-yaml');
const fs = require('fs');
const dotenv = require('dotenv');
const { Command, flags } = require('@oclif/command');

const Beau = require('../../src/beau');

class Base extends Command {
    openConfigFile(configFile) {
        if (!fs.existsSync(configFile)) {
            this.error(`The config file, ${configFile} was not found.`);
            this.exit(1);
        }

        return yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
    }

    loadConfig(configFile, params = []) {
        const config = this.openConfigFile(configFile);
        const env = dotenv.config().parsed || {};
        params = dotenv.parse(params.reduce((a, p) => a + '\n' + p, ''));

        const envParams = { params: Object.assign(env, params) };

        return new Beau(config, envParams);
    }
}

Base.flags = {
    config: flags.string({
        char: 'c',
        description: 'The configuration file to be used.',
        default: 'beau.yml'
    }),
    verbose: flags.boolean({
        char: 'V',
        description: 'Show all additional information available for a command.'
    }),
    'no-format': flags.boolean({
        description: `Disables color formatting for usage on external tools.`
    })
};

module.exports = Base;
