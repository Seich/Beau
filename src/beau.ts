import deepmerge from "deepmerge"
import {BeauConfig, Config} from "./config"
import {moduleVersion} from './shared'

const RequestList = require('./requestList')

class Beau {
    config: Config

    constructor(doc: BeauConfig, env = {}) {
        doc.environment = deepmerge(doc.environment, env)
        this.config = new Config(doc)
        this.requests = new RequestList(this.config)

        if (this.config.VERSION !== moduleVersion()) {
            console.warn(
                `This Beau file expects v${
                    this.config.VERSION
                }. You are using v${moduleVersion()}.`
            )
        }
    }
}

module.exports = Beau
