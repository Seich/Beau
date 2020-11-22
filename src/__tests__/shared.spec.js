const {
    requestRegex,
    replacementRegex,
    dynamicValueRegex,
    UpperCaseKeys,
    removeOptionalKeys,
    toKebabCase,
    replaceInObject,
    expandPath
} = require('../shared')

describe('Shared Utilities', () => {
    describe('requestRegex', () => {
        test.each([
            ['GET /hello', true],
            ['HEAD /hello', true],
            ['POST /hello', true],
            ['PUT /hello', true],
            ['DELETE /hello', true],
            ['CONNECT /hello', true],
            ['OPTIONS /hello', true],
            ['TRACE /hello', true],
            ['PATCH /hello', true]
        ])('should match: %s', (example, expected) => {
            expect(requestRegex.test(example)).toBe(expected)
        })
    })

    describe('replacementRegex', () => {
        test.each([
            ['$a.b', ['$a.b']],
            ['GET /hello/$a.name', ['$a.name']],
            ['PUT /hi/$a.a/$a.b', ['$a.a', '$a.b']],
            [`\\$value`, ['\\$value']]
        ])('should match: %s', (example, expected) => {
            expect(example.match(replacementRegex)).toEqual(expected)
        })
    })

    describe('dynamicValueRegex', () => {
        test.each([
            ['$[test()]', ['$[test()]']],
            ['$[test(1, 2, 3)]', ['$[test(1, 2, 3)]']],
            [`$[test({ \n id: 1 \n })]`, ['$[test({ \n id: 1 \n })]']]
        ])('should match: %s', (example, expected) => {
            expect(example.match(dynamicValueRegex)).toEqual(expected)
        })
    })

    describe('UpperCaseKeys', () => {
        it('should uppercase all first-level keys in an object', () => {
            let a = { test: 1, Test2: 2 }
            expect(UpperCaseKeys(a)).toEqual({ TEST: 1, TEST2: 2 })
        })
    })

    describe('removeOptionalKeys', () => {
        it('should remove empty objects from an object', () => {
            let a = { b: {}, c: 2, d: {} }
            expect(removeOptionalKeys(a, ['b', 'd'])).toEqual({ c: 2 })
        })
    })

    describe('toKebabCase', () => {
        it('should convert camel case to kebab case', () => {
            expect(toKebabCase('helloWorld')).toBe('hello-world')
        })
    })

    describe('replaceInObject', () => {
        it('should replace every value in an object with the output of a function', () => {
            let a = { b: 'b', c: 'c' }
            expect(replaceInObject(a, (obj) => 'a')).toEqual({ b: 'a', c: 'a' })
        })
    })

    describe('expandPath', () => {
        test.each([
            ['https://alchem.ee', 'api/v1/hello'],
            ['https://alchem.ee/', '/api/v1/hello'],
            ['https://alchem.ee', '/api/v1/hello'],
            ['https://alchem.ee/', 'api/v1/hello']
        ])(
            'should add a base url to the path is the path is not a url: %s, %s',
            (url, path) => {
                expect(expandPath(url, path)).toEqual(
                    'https://alchem.ee/api/v1/hello'
                )
            }
        )

        it('should return the path if its a fully fledged url on its own', () => {
            expect(
                expandPath('https://alchem.ee', 'https://martianwabbit.com')
            ).toEqual('https://martianwabbit.com')
        })
    })
})
