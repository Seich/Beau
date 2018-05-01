const clc = require('cli-color');
const jsome = require('jsome');
const { Line, Spinner } = require('clui');
const { flags } = require('@oclif/command');

const Base = require('../base');

class RequestCommand extends Base {
	prettyOutput(res, verbose = false) {
		let { status, body } = res.response;

		this.spinner.stop();

		status = status.toString().startsWith(2)
			? clc.green(status)
			: clc.red(status);

		new Line()
			.padding(2)
			.column('Status', 20, [clc.cyan])
			.column('Endpoint', 20, [clc.cyan])
			.output();

		new Line()
			.padding(2)
			.column(status, 20)
			.column(res.request.endpoint)
			.output();

		new Line().output();

		jsome((verbose ? res : body) || null);
	}

	async run() {
		const { flags, args } = this.parse(RequestCommand);
		const Beau = this.loadConfig(flags.config);
		this.spinner = new Spinner(clc.yellow(`Requesting: ${args.alias}`), [
			'⣾',
			'⣽',
			'⣻',
			'⢿',
			'⡿',
			'⣟',
			'⣯',
			'⣷'
		]);

		try {
			if (!flags['no-format']) {
				this.spinner.start();
			}

			let res = await Beau.requests.execByAlias(args.alias);

			if (flags['no-format']) {
				this.log(res.response.status);
				this.log(res.request.endpoint);
				this.log(JSON.stringify(res.response.headers));
				this.log(JSON.stringify(res.response.body));
			} else {
				this.prettyOutput(res, flags.verbose);
			}
		} catch (err) {
			new Line().output();
			this.spinner.stop();
			this.error(err.message);
		}
	}
}

RequestCommand.description = `Executes a request by name.`;
RequestCommand.flags = { ...Base.flags };

RequestCommand.args = [
	{
		name: 'alias',
		required: true,
		description: `The alias of the request to execute.`
	}
];

module.exports = RequestCommand;
