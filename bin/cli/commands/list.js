const clc = require('cli-color');
const { Line } = require('clui');
const { flags } = require('@oclif/command');

const Base = require('../base');

class ListCommand extends Base {
	async run() {
		const { flags } = this.parse(ListCommand);
		const Beau = this.loadConfig(flags.config);

		if (flags.format === false) {
			return Beau.requests.list.forEach(
				({ VERB, ALIAS, ENDPOINT, PATH }) =>
					this.log(
						VERB +
							`\t` +
							ALIAS +
							`\t` +
							ENDPOINT.replace(/\/$/, '') +
							`/` +
							PATH.replace(/^\//, '')
					)
			);
		}

		new Line()
			.padding(2)
			.column('HTTP Verb', 20, [clc.cyan])
			.column('Alias', 30, [clc.cyan])
			.column('Endpoint', 20, [clc.cyan])
			.output();

		Beau.requests.list.forEach(({ VERB, ALIAS, ENDPOINT, PATH }) =>
			new Line()
				.padding(2)
				.column(VERB, 20, [clc.yellow])
				.column(ALIAS, 30, [clc.yellow])
				.column(
					ENDPOINT.replace(/\/$/, '') + '/' + PATH.replace(/^\//, '')
				)
				.output()
		);

		new Line().output();
	}
}

ListCommand.description = `Lists all available requests in the config file.`;
ListCommand.flags = { ...Base.flags };

module.exports = ListCommand;
