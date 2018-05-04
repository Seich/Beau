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
            if (result[part] === undefined) {
                throw new Error(`${path} not found in cache.`);
            }

            result = result[part];
        });

        return result;
    }

    parse(item) {
        if (item === null) {
            return null;
        }

        return replaceInObject(item, item => {
            return item.replace(replacementRegex, (match, key) => {
                if (match.startsWith('\\')) {
                    return match.replace('\\$', '$');
                }

                return this.get(key);
            });
        });
    }
}

module.exports = RequestCache;
