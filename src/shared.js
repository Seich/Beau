const { URL } = require('url');

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
    Object.entries(obj).forEach(([k, v]) => (result[k.toUpperCase()] = v));
    return result;
};

const isEmptyObject = obj =>
    Object.keys(obj).length === 0 && obj.constructor === Object;

const removeOptionalKeys = function(obj, optionalValues) {
    let result = {};

    Object.entries(obj).forEach(([key, value]) => {
        if (optionalValues.includes(key) && isEmptyObject(value)) {
            return;
        }

        result[key] = value;
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

    switch (typeof obj) {
        case 'undefined':
            return {};
        case 'string':
            return fn(obj);
        case 'object':
            obj = Object.assign({}, obj);
            Object.entries(obj).forEach(
                ([key, value]) => (obj[key] = replaceInObject(value, fn))
            );
        default:
            return obj;
    }
};

const moduleVersion = () => parseInt(require('../package.json').version, 10);

const isUrl = function(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = {
    requestRegex,
    replacementRegex,
    dynamicValueRegex,
    UpperCaseKeys,
    removeOptionalKeys,
    toKebabCase,
    replaceInObject,
    moduleVersion,
    isUrl
};
