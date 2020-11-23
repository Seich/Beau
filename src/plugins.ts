import vm = require('vm')
import * as deepmerge from 'deepmerge'
import { toKebabCase, dynamicValueRegex, replaceInObject } from './shared'
import { isPlainObject } from 'is-plain-object'
import { RequestObject } from './config'

const requireg = require('requireg')

type PluginFn = (arg0: any, arg1: any) => any

interface IPluginRegistry {
    preRequestModifiers: PluginFn[]
    postRequestModifiers: PluginFn[]
    dynamicValues: Array<{ name: string; fn: PluginFn }>
}

type PluginType =
    | 'preRequestModifiers'
    | 'postRequestModifiers'
    | 'dynamicValues'

export default class Plugins {
    registry: IPluginRegistry
    context: vm.Context
    autoload: string[] = []

    constructor(
        plugins: Array<string | { [key: string]: any }> = [],
        autoload = ['std']
    ) {
        this.registry = {
            preRequestModifiers: [],
            postRequestModifiers: [],
            dynamicValues: []
        }

        this.context = {}
        this.autoload = autoload
        this.loadPlugins(plugins.concat(this.autoload))
    }

    normalizePlugins(plugins: Array<string | { [key: string]: any }>) {
        let results: { [key: string]: any } = {}

        plugins.forEach((plugin) => {
            let name = plugin
            let settings = undefined

            if (typeof plugin === 'object') {
                let keys = Object.keys(plugin)

                if (keys.length !== 1) {
                    throw new Error(`Plugin items should contain only one key.`)
                }

                name = keys[0]
                settings = plugin[name]
            }

            results[name as string] = settings
        })

        return results
    }

    loadPlugins(pluginsToLoad: Array<string | { [key: string]: any }>) {
        const plugins = this.normalizePlugins(pluginsToLoad)
        Object.keys(plugins).forEach((name) => {
            const module = `beau-${toKebabCase(name)}`

            if (typeof requireg.resolve(module) !== 'undefined') {
                const plugin = requireg(module)
                new plugin(this, plugins[name])
            } else {
                if (this.autoload.includes(name)) return

                console.warn(
                    `Plugin ${name} couldn't be found. It is available globally?`
                )
            }
        })
    }

    executeModifier<T extends object>(
        modifier: PluginType,
        obj: T,
        orig: RequestObject
    ): T {
        let result = deepmerge<T>({}, obj, { isMergeableObject: isPlainObject })
        this.registry[modifier].forEach((mod: any) => (result = mod(result, orig)))
        return result
    }

    replaceDynamicValues(obj: { [key: string]: any }) {
        vm.createContext(this.context)
        return replaceInObject(obj, (val) => {
            let valIsEmpty = val.trim().length === 0

            if (valIsEmpty) {
                return val
            }

            try {
                let onlyHasDynamic =
                    val.replace(dynamicValueRegex, '').trim() === ''

                if (onlyHasDynamic) {
                    let call = ''
                    val.replace(dynamicValueRegex, (_, c) => {
                        call = c
                        return ''
                    })

                    return vm.runInContext(call, this.context)
                }

                return val.replace(dynamicValueRegex, (_, call) => {
                    return vm.runInContext(call, this.context)
                })
            } catch (e) {
                throw new Error(`DynamicValue: ` + e)
            }
        })
    }

    addPreRequestModifier(modifier: any) {
        this.registry.preRequestModifiers.push(modifier)
    }

    addPostRequestModifier(modifier: any) {
        this.registry.postRequestModifiers.push(modifier)
    }

    defineDynamicValue(name: string, fn: (arg0: any, arg1: any) => string) {
        this.registry.dynamicValues.push({ name, fn })
        this.context[name] = fn
    }
}
