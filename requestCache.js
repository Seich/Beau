const { replacementRegex } = require('./shared');

class RequestCache {
	constructor() {
		this.$cache = {};
	}

	add(key, value) {
		this.$cache[key] = value;
	}

	get(path) {
		let result = this.$cache;

		path.split('.').forEach(part => {
			if (result === undefined) return;
			result = result[part];
		});

		if (typeof result === 'undefined') {
			throw new Error('Key not found in cache: ', path);
		}

		return result;
	}

	safely(val) {
		if (typeof val === 'undefined')
			return {};

		return this.parse(val);
	}

	parse(item) {
		if (typeof item === 'string') {
			return item.replace(replacementRegex, key => this.get(key));
		} else if(typeof item === 'object' && item !== null) {
			Object.keys(item).forEach(k => item[k] = this.parse(item[k]));
			return item;
		} else {
			return item;
		}
	}
}

module.exports = RequestCache;
