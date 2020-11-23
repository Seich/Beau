import { moduleVersion } from './shared'
import RequestList from './requestList'
import Config, { BeauConfig } from './config'
import * as deepmerge from 'deepmerge'

export default class Beau {
    config: Config
    requests: RequestList

    constructor(doc: BeauConfig, env = {}) {
        doc.environment = deepmerge(doc.environment ?? {}, env)
        this.config = new Config(doc)
        this.requests = new RequestList(this.config)

        if (this.config.version !== moduleVersion()) {
            console.warn(
                `This Beau file expects v${
                    this.config.version
                }. You are using v${moduleVersion()}.`
            )
        }
    }
}
