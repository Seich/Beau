class BeauStd {
	constructor(registry, settings) {
		registry.defineDynamicValue('createReadStream', () => {});
	}
}

module.exports = BeauStd;
