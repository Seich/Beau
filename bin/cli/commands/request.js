const Base = require('../base')
const cj = require('color-json')
const clc = require('cli-color')
const prompts = require('prompts')
const { Line, Spinner } = require('clui')
const { flags } = require('@oclif/command')
const { expandPath } = require('../../../src/shared')

class RequestCommand extends Base {
    prettyOutput(res, verbose = false) {
        let { status, body } = res.response

        this.spinner.stop()

        status = status.toString().startsWith(2)
            ? clc.green(status)
            : clc.red(status)

        new Line()
            .padding(2)
            .column('Status', 20, [clc.cyan])
            .column('Endpoint', 20, [clc.cyan])
            .output()

        new Line()
            .padding(2)
            .column(status, 20)
            .column(res.request.endpoint)
            .output()

        new Line().output()

        const result = (verbose ? res : body) || null
        if (typeof result === 'object') {
            this.log(cj(result))
        } else if (typeof result === 'string') {
            this.log(result)
        }
    }

    async run() {
        const {
            flags: {
                param: params,
                config,
                'no-format': noFormat = false,
                verbose = false,
                'as-json': asJson = false,
                quiet = false,
                interactive = false
            },
            args
        } = this.parse(RequestCommand)

        const Beau = this.loadConfig(config, params)

        const spinnerSprite = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']
        this.spinner = new Spinner('', spinnerSprite)

        let spinnerEnabled = !noFormat && !asJson && !quiet

        if (typeof args.alias == 'undefined' && !interactive) {
            this.error(
                'Missing 1 required argument: The alias of the request to execute.'
            )
        }

        if (interactive) {
            const requests = Beau.requests.list.map(
                ({ VERB, ALIAS, ENDPOINT, PATH }) => ({
                    title: `${VERB} ${PATH} - ${ALIAS}`,
                    value: ALIAS,
                    description: expandPath(ENDPOINT, PATH)
                })
            )

            const { name } = await prompts({
                name: 'name',
                message: 'Pick as Request to execute',
                type: 'select',
                choices: requests
            })

            args.alias = name
        }

        if (spinnerEnabled) {
            this.spinner.start()
        }

        let res
        try {
            res = await Beau.requests.execByAlias(args.alias)
        } catch (err) {
            this.spinner.stop()

            if (!quiet) {
                this.error(err.message)
            }

            this.exit(1)
        }

        if (quiet) {
            return
        }

        if (asJson) {
            return this.log(JSON.stringify(verbose ? res : res.response))
        }

        if (noFormat) {
            this.log(res.response.status)
            this.log(res.request.endpoint)
            this.log(JSON.stringify(res.response.headers))
            this.log(JSON.stringify(res.response.body))
            return
        }

        this.prettyOutput(res, verbose)
    }
}

RequestCommand.description = `Executes a request by name.`
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
    }),

    interactive: flags.boolean({
        char: 'i',
        description: 'Choose request interactively.',
        default: false
    })
}

RequestCommand.args = [
    {
        name: 'alias',
        required: false,
        description: `The alias of the request to execute.`
    }
]

module.exports = RequestCommand
