const { Command, flags } = require('@oclif/command')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const Beau = require('../../src/beau')

class Base extends Command {
    openConfigFile(configFile) {
        if (!fs.existsSync(configFile)) {
            throw new Error(`The config file, ${configFile} was not found.`)
        }

        let config
        yaml.safeLoadAll(fs.readFileSync(configFile, 'utf-8'), (doc) => {
            if (typeof config === 'undefined') {
                config = doc
            } else {
                if (typeof config.hosts === 'undefined') {
                    config.hosts = []
                }

                config.hosts.push(doc)
            }
        })

        return config
    }
    loadConfig(configFile, params = []) {
        const config = this.openConfigFile(configFile)
        const env = dotenv.config().parsed || {}
        params = dotenv.parse(params.join('\n'))

        const envParams = { _: Object.assign(env, params) }

        const configFileDir = path.dirname(
            path.resolve(process.cwd(), configFile)
        )

        process.chdir(configFileDir)

        return new Beau(config, envParams)
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
        description: `Show all additional information available for a command.`
    }),
    'no-format': flags.boolean({
        description: `Disables color formatting for usage on external tools.`
    })
}

module.exports = Base
