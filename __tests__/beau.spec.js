const Beau = require('../beau');
const yaml = require('js-yaml');

describe(`Beau's config Loader.`, () => {
	it('Should only load valid configuration keys', () => {
		let host = 'http://martianwabbit.com';
		let version = 1;
		let cache = false;
		let shouldntBeAdded = true;

		let beau = new Beau({
			version,
			host,
			cache,
			shouldntBeAdded
		});

		expect(beau.config.HOST).toBe(host);
		expect(beau.config.CACHE).toBe(cache);
		expect(beau.config.VERSION).toBe(version);
		expect(beau.config.shouldntBeAdded).toBeUndefined();
	});
});
