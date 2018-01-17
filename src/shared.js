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

module.exports = {
	httpVerbs,
	requestRegex,
	replacementRegex,
	UpperCaseKeys
};
