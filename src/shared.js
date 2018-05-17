const httpVerbs = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH'
];

const requestRegex = new RegExp(`(${httpVerbs.join('|')})\\s(.*)`, 'i');
const replacementRegex = /(?:\\?)\$([a-zA-Z\.\d\-\_\/\\\:]+)/g;
const dynamicValueRegex = /\$\[(\w+\((?:.|[\n\r])*?\))\]/g;

const UpperCaseKeys = function(obj) {
    let result = {};
    Object.keys(obj).forEach(k => (result[k.toUpperCase()] = obj[k]));
    return result;
};

const removeOptionalKeys = function(obj, optionalValues) {
    let result = {};

    Object.keys(obj).forEach(key => {
        if (
            optionalValues.includes(key) &&
            (Object.keys(obj[key]).length === 0 &&
                obj[key].constructor === Object)
        ) {
            return;
        }

        result[key] = obj[key];
    });

    return result;
};

const toKebabCase = function(str) {
    return str
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
};

const replaceInObject = function(obj, fn) {
    if (obj === null) {
        return null;
    }

    let type = typeof obj;

    if (type === 'undefined') {
        return {};
    }

    if (type === 'string') {
        return fn(obj);
    }

    if (type === 'object') {
        Object.keys(obj).forEach(k => (obj[k] = replaceInObject(obj[k], fn)));
    }

    return obj;
};

module.exports = {
    requestRegex,
    replacementRegex,
    dynamicValueRegex,
    UpperCaseKeys,
    removeOptionalKeys,
    toKebabCase,
    replaceInObject
};
