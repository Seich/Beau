const { replacementRegex } = require('./shared');

class RequestCache {
	constructor() {
		this.$cache = {};
	}

	exists(key) {
		return typeof this.$cache[key] !== 'undefined';
	}

	add(key, value) {
		this.$cache[key] = value;
	}

	get(path) {
		let result = this.$cache;
		path.split('.').forEach(part => {
			result = result[part];
		});

		if (typeof result === 'undefined') {
			throw new Error(`${path} not found in cache: `, path);
		}

		return result;
	}

	parse(item) {
		let type = typeof item;

		if (type === 'undefined') {
			return {};
		}

		if (item === null) {
			return null;
		}

		if (type === 'string') {
			return item.replace(replacementRegex, key => this.get(key));
		}

		if (type === 'object') {
			Object.keys(item).forEach(k => (item[k] = this.parse(item[k])));
			return item;
		}

		return item;
	}
}

module.exports = RequestCache;
