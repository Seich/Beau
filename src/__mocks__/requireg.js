function requireg(name) {
	return require(name);
}

requireg.std_resolving = false;

requireg.resolve = function(name) {
	if (requireg.std_resolving) {
		return '';
	} else {
		throw new Error(`Failed to resolve.`);
	}
};

module.exports = requireg;
