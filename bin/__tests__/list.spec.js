const { test, expect } = require('@oclif/test');
const Nock = require('@fancy-test/nock');

const Test = test.register('nock', Nock);

describe('List Command', () => {
	let a = Test.stdout().command(['list', '-c', 'hello.yml']);
	a.it('tst', ctx => {
		console.log(ctx);
	});
});
