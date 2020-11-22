import { URL } from 'url'

export const httpVerbs = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH'
]

export const requestRegex = new RegExp(`(${httpVerbs.join('|')})\\s(.*)`, 'i')
export const replacementRegex = /(?:\\?)\$([a-zA-Z\.\d\-\_\:]+)/g
export const dynamicValueRegex = /\$\[(\w+\((?:.|[\n\r])*?\))\]/g

export const isEmptyObject = (obj: object) =>
    Object.keys(obj).length === 0 && obj.constructor === Object

export const removeOptionalKeys = function (
    obj: object,
    optionalValues: string[]
): typeof obj {
    let result = {}

    Object.entries(obj).forEach(([key, value]) => {
        if (optionalValues.includes(key) && isEmptyObject(value)) {
            return
        }

        result[key] = value
    })

    return result
}

export const toKebabCase = function (str: string) {
    return str
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()
}

export const replaceInObject = function<T> (
    obj: T,
    fn: (arg0: string) => string
): T | null | {} | string {
    if (obj === null) {
        return null
    }

    switch (typeof obj) {
        case 'undefined':
            return {}
        case 'string':
            return fn(obj)
        case 'object':
            obj = Object.assign({}, obj)
            Object.entries(obj).forEach(
                ([key, value]) => (obj[key] = replaceInObject(value, fn))
            )
        default:
            return obj
    }
}

export const moduleVersion = () =>
    parseInt(require('../package.json').version, 10)

export const isUrl = function (str: string) {
    try {
        new URL(str)
        return true
    } catch (e) {
        return false
    }
}

export const expandPath = (url: string, path: string) => {
    if (isUrl(path)) {
        return path
    }

    return url.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
}
