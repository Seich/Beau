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
const replacementRegex = /(?:\\?)\$([a-zA-Z\.\d\-\_\:]+)/g;
const dynamicValueRegex = /\$\[(\w+\((?:.|[\n\r])*?\))\]/g;

const UpperCaseKeys = function(obj) {
    let result = {};
    Object.keys(obj).forEach(k => (result[k.toUpperCase()] = obj[k]));
    return result;
};

const isEmptyObject = obj =>
    Object.keys(obj).length === 0 && obj.constructor === Object;

const removeOptionalKeys = function(obj, optionalValues) {
    let result = {};

    Object.keys(obj).forEach(key => {
        if (optionalValues.includes(key) && isEmptyObject(obj[key])) {
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
        obj = Object.assign({}, obj);
        Object.keys(obj).forEach(k => (obj[k] = replaceInObject(obj[k], fn)));
    }

    return obj;
};

const moduleVersion = () => parseInt(require('../package.json').version, 10);

module.exports = {
    requestRegex,
    replacementRegex,
    dynamicValueRegex,
    UpperCaseKeys,
    removeOptionalKeys,
    toKebabCase,
    replaceInObject,
    moduleVersion
};
