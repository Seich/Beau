import Config from './config'
import Request from './request'
import RequestCache from './requestCache'

class RequestList {
    list: Request[] = []
    cache: RequestCache

    constructor(config: Config) {
        this.list = config.requests.map(
            (req) => new Request(req, config.plugins)
        )

        this.cache = new RequestCache()
        this.cache.add(`env`, config.environment)
    }

    async execByAlias(alias: string) {
        if (this.cache.exists(alias)) {
            return this.cache.get(alias)
        }

        const request = this.list.find((r) => r.ALIAS === alias)

        if (typeof request === 'undefined') {
            throw new Error(`${alias} not found among the requests.`)
        }

        try {
            await this.fetchDependencies(Array.from(request.DEPENDENCIES))
            return await request.exec(this.cache)
        } catch (reason) {
            throw new Error(
                `Request ${request.VERB} ${request.ENDPOINT} FAILED. \n${reason}`
            )
        }
    }

    async fetchDependencies(dependencies) {
        dependencies = dependencies.map((d) => this.execByAlias(d))
        await Promise.all(dependencies)

        return this.cache
    }
}

module.exports = RequestList
