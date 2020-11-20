const fs = jest.genMockFromModule('fs')

fs.existsSync = (filename) => filename === 'beau.yml'
fs.readFileSync = () => `
version: 1
endpoint: https://example.org/

GET /anything:
  alias: anything
  payload:
    name: $env.params.name
`

module.exports = fs
