import Config from './config'
import Request from './request'
import RequestCache from './requestCache'

export default class RequestList {
    list: Request[] = []
    cache: RequestCache

    constructor(config: Config = new Config({})) {
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

        const request = this.list.find((r) => r.alias === alias)

        if (typeof request === 'undefined') {
            throw new Error(`${alias} not found among the requests.`)
        }

        try {
            await this.fetchDependencies(Array.from(request.dependencies))
            return await request.exec(this.cache)
        } catch (reason) {
            throw new Error(
                `Request ${request.verb} ${request.endpoint} FAILED. \n${reason}`
            )
        }
    }

    async fetchDependencies(dependencies: string[]) {
        const requests = dependencies.map((d) => this.execByAlias(d))
        await Promise.all(requests)

        return this.cache
    }
}

