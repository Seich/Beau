const vm = require('vm')
const requireg = require('requireg')
const deepmerge = require('deepmerge')
const { toKebabCase, dynamicValueRegex, replaceInObject } = require('./shared')
const { isPlainObject } = require('is-plain-object')

export default class Plugins {
    constructor(plugins = [], autoload = ['std']) {
        this.registry = {
            preRequestModifiers: [],
            postRequestModifiers: [],
            dynamicValues: []
        }

        this.context = {}

        this.autoload = autoload

        this.loadPlugins(plugins.concat(this.autoload))
    }

    normalizePlugins(plugins) {
        let results = {}

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

            results[name] = settings
        })

        return results
    }

    loadPlugins(plugins) {
        plugins = this.normalizePlugins(plugins)
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

    executeModifier(modifier, obj, orig) {
        let result = deepmerge({}, obj, { isMergeableObject: isPlainObject })

        this.registry[modifier].forEach(
            (modifier) => (result = modifier(result, orig))
        )

        return result
    }

    replaceDynamicValues(obj) {
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
                    let call
                    val.replace(dynamicValueRegex, (match, c) => {
                        call = c
                    })

                    return vm.runInContext(call, this.context)
                }

                return val.replace(dynamicValueRegex, (match, call) => {
                    return vm.runInContext(call, this.context)
                })
            } catch (e) {
                throw new Error(`DynamicValue: ` + e)
            }
        })
    }

    addPreRequestModifier(modifier) {
        this.registry.preRequestModifiers.push(modifier)
    }

    addPostRequestModifier(modifier) {
        this.registry.postRequestModifiers.push(modifier)
    }

    defineDynamicValue(name, fn) {
        this.registry.dynamicValues.push({ name, fn })
        this.context[name] = fn
    }
}

