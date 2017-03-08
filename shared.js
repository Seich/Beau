const httpVerbs = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'];
const requestRegex = new RegExp(`(${httpVerbs.join('|')})\\s(.*)`, 'i');
const replacementRegex = /\$([a-zA-Z\.\d\-\_]*)/g;

module.exports = {
	httpVerbs,
	requestRegex,
	replacementRegex
};
