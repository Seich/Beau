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
const replacementRegex = /\$([a-zA-Z\.\d\-\_\/\\\:]*)/g;

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

module.exports = {
	httpVerbs,
	requestRegex,
	replacementRegex,
	UpperCaseKeys,
	removeOptionalKeys
};
