function requireg(name) {
    return require(name);
}

requireg.resolving = true;

requireg.resolve = function(name) {
    if (requireg.resolving) {
        return '';
    } else {
        return undefined;
    }
};

module.exports = requireg;
