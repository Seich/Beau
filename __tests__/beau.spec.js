const fs = require('fs');
const Beau = require('../beau');
const yaml = require('js-yaml');

describe(`Beau's config Loader.`, () => {
	it ('Should only load valid configuration keys', () => {
		let HOST = 'http:/martianwabbit.com';
		let VERSION = 2;
		let CACHE = false;
		let shouldntBeAdded = true;

		let beau = new Beau({
			VERSION,
			HOST,
			CACHE,
			shouldntBeAdded
		});

		expect(beau.config.HOST).toBe(HOST);
		expect(beau.config.CACHE).toBe(CACHE);
		expect(beau.config.VERSION).toBe(VERSION);
		expect(beau.config.shouldntBeAdded).toBeUndefined();
	});
});
