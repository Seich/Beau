import { UObjectString } from './config'
import { replacementRegex, replaceInObject } from './shared'

export default class RequestCache {
    $cache: { [key: string]: UObjectString } = {}

    exists(key: string) {
        return typeof this.$cache[key] !== 'undefined'
    }

    add(key: string, value: any) {
        this.$cache[key] = value
    }

    get(path: string): UObjectString {
        let crawler: UObjectString = this.$cache
        path.split('.').forEach((part) => {
            if (typeof crawler === 'string' || crawler[part] === undefined) {
                throw new Error(`${path} not found in cache.`)
            }

            crawler = crawler[part]
        })

        return crawler
    }

    parse(
        item: { [key: string]: any } | null | undefined | string
    ): typeof item {
        if (item === null) {
            return null
        }

        return replaceInObject(item, (item) =>
            item.replace(replacementRegex, (match, key) => {
                if (match.startsWith('\\')) {
                    return match.replace('\\$', '$')
                }

                return this.get(key) as string
            })
        )
    }
}
