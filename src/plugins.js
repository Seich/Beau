const vm = require('vm');
const requireg = require('requireg');
const deepmerge = require('deepmerge');
const { toKebabCase, dynamicValueRegex, replaceInObject } = require('./shared');
const isPlainObject = require('is-plain-object');

class Plugins {
	constructor(plugins = []) {
		this.registry = {
			preRequestModifiers: [],
			postRequestModifiers: [],
			dynamicValues: []
		};

		this.context = {};

		plugins.forEach(plugin => this.loadPlugin(plugin));
	}

	loadPlugin(plugin) {
		let name = plugin;
		let settings = {};

		if (typeof plugin === 'object') {
			let keys = Object.keys(plugin);

			if (keys.length !== 1) {
				throw new Error(`Plugin items should contain only one key.`);
			}

			name = keys[0];
			settings = plugin[name];
		}

		plugin = requireg(`beau-${toKebabCase(name)}`);
		new plugin(this, settings);
	}

	executeModifier(modifier, obj, orig) {
		let result = deepmerge({}, obj, { isMergeableObject: isPlainObject });

		this.registry[modifier].forEach(
			modifier => (result = modifier(result, orig))
		);

		return result;
	}

	replaceDynamicValues(obj) {
		return replaceInObject(obj, val => {
			let valIsEmpty = val.trim().length === 0;

			if (valIsEmpty) {
				return val;
			}

			try {
				let onlyHasDynamic =
					val.replace(dynamicValueRegex, '').trim() === '';

				if (onlyHasDynamic) {
					let call;
					val.replace(dynamicValueRegex, (match, c) => {
						call = c;
					});

					return vm.runInContext(call, this.context);
				}

				return val.replace(dynamicValueRegex, (match, call) => {
					return vm.runInContext(call, this.context);
				});
			} catch (e) {
				throw new Error(`DynamicValue: ` + e);
			}
		});
	}

	addPreRequestModifier(modifier) {
		this.registry.preRequestModifiers.push(modifier);
	}

	addPostRequestModifier(modifier) {
		this.registry.postRequestModifiers.push(modifier);
	}

	defineDynamicValue(name, fn) {
		this.registry.dynamicValues.push({ name, fn });
		this.context[name] = fn;

		vm.createContext(this.context);
	}
}

module.exports = Plugins;
