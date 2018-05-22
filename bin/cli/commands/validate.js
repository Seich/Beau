const { flags, Command } = require('@oclif/command');
const { baseFlags, openConfigFile } = require('../utils');
const { validate } = require('../../../src/schema.js');

class ValidateCommand extends Command {
    async run() {
        const { flags, args } = this.parse(ValidateCommand);
        const configFile = args.alias || flags.config;

        const config = openConfigFile(configFile);

        let result = await validate(config);
        if (result.valid) {
            this.log(`${configFile} is valid.`);
        } else {
            this.error(result.message);
        }
    }
}

ValidateCommand.description = `Validates the given configuration file against Beau's configuration schema.`;
ValidateCommand.flags = { ...baseFlags };
ValidateCommand.args = [
    {
        name: 'alias',
        required: false,
        description: `The configuration file to validate.`
    }
];
module.exports = ValidateCommand;
