const schema = require('../schema');

describe('Schema', () => {
	it(`should validate an object against the schema`, async () => {
		await expect(
			schema.validate({ endpoint: 'http://example.com' })
		).resolves.toHaveProperty('valid', true);
	});

	it(`should indicate the error when an schema is invalid`, async () => {
		await expect(
			schema.validate({ plugins: [{ hello: 1, world: 2 }] })
		).resolves.toHaveProperty('valid', false);
	});
});
