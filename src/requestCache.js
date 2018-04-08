const { replacementRegex, replaceInObject } = require('./shared');

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
		if (item === null) {
			return null;
		}

		return replaceInObject(item, item =>
			item.replace(replacementRegex, key => this.get(key))
		);
	}
}

module.exports = RequestCache;
