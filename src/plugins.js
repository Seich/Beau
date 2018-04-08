const vm = require('vm');
const requireg = require('requireg');
const deepmerge = require('deepmerge');
const { toKebabCase, dynamicValueRegex, replaceInObject } = require('./shared');

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

			name = Object.keys(plugin)[0];
			settings = plugin[name];
		}

		plugin = requireg(`./beau-${toKebabCase(name)}`);
		new plugin(this, settings);
	}

	executeModifier(modifier, obj, orig) {
		let result = deepmerge({}, obj);

		this.registry[modifier].forEach(
			modifier => (result = modifier(result, orig))
		);

		return result;
	}

	execPreRequestModifiers(request, originalRequest) {
		return this.executeModifier(
			'preRequestModifiers',
			request,
			originalRequest
		);
	}

	execPostRequestModifiers(response, originalRequest) {
		return this.executeModifier(
			'postRequestModifiers',
			response,
			originalRequest
		);
	}

	replaceDynamicValues(obj) {
		return replaceInObject(obj, val => {
			try {
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
