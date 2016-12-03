const RequestCache = require('../requestCache');

describe('Request Cache', () => {
	let cache;

	beforeEach(() => {
		cache = new RequestCache();

		cache.add('$session', {
			hello: 'World'
		});

		cache.add('$array', [{
			id: 1,
			name: 'Sergio'
		}, {
			id: 2,
			name: 'Angela'
		}]);
	});

	it('should add keys to the cache', () => {
		expect(cache.$cache.$session.hello).toBe('World');
	});

	describe('get', () => {
		it('should be able to find key values with a given path', () => {
			expect(cache.get('$session.hello')).toBe('World');
		});

		it('should throw when given an invalid path', () => {
			expect(cache.get('$session.hello')).toThrow();
		});
	});


	describe('parse', () => {
		it('should transform variables in strings using it\'s cache', () => {
			expect(cache.parse('Hello $session.hello')).toBe('Hello World');
		});

		it('should go transform variables in all values when given an object', () => {
			let parsed = cache.parse({ hello: 'hello $session.hello', earth: '$session.hello' });
			expect(parsed.hello).toBe('hello World');
			expect(parsed.earth).toBe('World');
		});

		it('should return every non-string value as-is', () => {
			let parsed = cache.parse({ number: 1, nulled: null, truthy: false, hello: '$session.hello' });
			expect(parsed.number).toBe(1);
			expect(parsed.nulled).toBeNull();
			expect(parsed.truthy).toBe(false);
			expect(parsed.hello).toBe('World');
		});

		it('should parse arrays as well', () => {
			let parsed = cache.parse({ hello: '$array.0.name' })
			expect(parsed.hello).toBe('Sergio');
			console.log([parsed]);
		});
	});

	describe('safely', () => {
		it('should return an object when given an undefined value', () => {
			expect(Object.keys(cache.safely(undefined)).length).toBe(0)
		});

		it('should parse any value other than undefined', () => {
			expect(cache.safely('Hello $session.hello')).toBe('Hello World');
		});
	});

});
