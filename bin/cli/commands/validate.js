const clc = require('cli-color');
const fs = require('fs');
const yaml = require('js-yaml');
const { flags } = require('@oclif/command');

const Base = require('../base');
const { validate } = require('../../../src/schema.js');

class ValidateCommand extends Base {
	async run() {
		const { flags, args } = this.parse(ValidateCommand);
		const configFile = args.alias || flags.config;

		const config = this.openConfigFile(configFile);

		let result = await validate(config);
		if (result.valid) {
			this.log(`${configFile} is valid.`);
		} else {
			this.error(result.message);
		}
	}
}

ValidateCommand.description = `Validates the given configuration file against Beau's configuration schema.`;
ValidateCommand.flags = { ...Base.flags };
ValidateCommand.args = [
	{
		name: 'alias',
		required: false,
		description: `The configuration file to validate.`
	}
];
module.exports = ValidateCommand;
