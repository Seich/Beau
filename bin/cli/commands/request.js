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
        const {
            flags: {
                param: params,
                config,
                'no-format': noFormat = false,
                verbose = false,
                'as-json': asJson = false,
                quiet = false
            },
            args
        } = this.parse(RequestCommand);

        const Beau = this.loadConfig(config, params);

        const spinnerSprite = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
        this.spinner = new Spinner(
            clc.yellow(`Requesting: ${args.alias}`),
            spinnerSprite
        );

        let spinnerEnabled = !noFormat && !asJson && !quiet;

        if (spinnerEnabled) {
            this.spinner.start();
        }

        let res;

        try {
            res = await Beau.requests.execByAlias(args.alias);
        } catch (err) {
            this.spinner.stop();

            if (!quiet) {
                this.error(err.message);
            }

            this.exit(1);
        }

        if (quiet) {
            return;
        }

        if (asJson) {
            return this.log(JSON.stringify(res.response));
        }

        if (noFormat) {
            this.log(res.response.status);
            this.log(res.request.endpoint);
            this.log(JSON.stringify(res.response.headers));
            this.log(JSON.stringify(res.response.body));
            return;
        }

        this.prettyOutput(res, verbose);
    }
}

RequestCommand.description = `Executes a request by name.`;
RequestCommand.flags = {
    ...Base.flags,
    param: flags.string({
        char: 'P',
        multiple: true,
        default: [],
        description: `Allows you to inject values into the request's environment.`
    }),

    quiet: flags.boolean({
        description: `Skips the output.`
    }),

    'as-json': flags.boolean({
        char: 'j',
        description: `Outputs the response as json.`
    })
};

RequestCommand.args = [
    {
        name: 'alias',
        required: true,
        description: `The alias of the request to execute.`
    }
];

module.exports = RequestCommand;
