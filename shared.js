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
const replacementRegex = /\$([a-zA-Z\.\d\-\_]*)/g;

module.exports = {
	httpVerbs,
	requestRegex,
	replacementRegex
};
