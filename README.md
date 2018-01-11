<div align="center">
	<img src="http://files.martianwabbit.com/beau.png?1" height="144"/>
</div>

<h1 align="center">Beau</h1>
<p align="center">Testing JSON APIs made easy.</p>
<p align="center">
	<a href="https://codeclimate.com/github/Seich/Beau/maintainability"><img src="https://api.codeclimate.com/v1/badges/bc2de4d71893d6a2d18b/maintainability" /></a>
	<a href="https://codeclimate.com/github/Seich/Beau/test_coverage"><img src="https://api.codeclimate.com/v1/badges/bc2de4d71893d6a2d18b/test_coverage" /></a>
	<a href="https://circleci.com/gh/Seich/Beau/tree/master"><img src="https://circleci.com/gh/Seich/Beau/tree/master.svg?style=svg" alt="CircleCI"></a>
</p>

## What is Beau?

Beau, is a CLI that executes HTTP requests based on a YAML configuration file. This makes testing easy, it allows you to share test requests with others as part of your repo.

![A Gif showing how beau works](http://files.martianwabbit.com/beau2.gif)

## Installation
	npm install -g beau

## Usage
	⚡  beau --help

	Usage: beau [options] [command]


	Options:

	-V, --version  output the version number
	-h, --help     output usage information


	Commands:

	request [options] <alias>
	list [options]

## Example Configuration File

	version: 1
	endpoint: https://example.com/api/

	POST /session:
		ALIAS: session
		PAYLOAD:
			username: seich
			password: hello01

	GET /profile
		ALIAS: profile
		HEADERS:
			authorization: Bearer $session.response.body.token

	GET /user/$profile.response.body.id/posts
		ALIAS: friends
		HEADERS:
			authorization: Bearer $session.response.body.token
		PARAMS:
			archived: true

## Example Usage
	beau request profile

That would execute the profile request along with it´s dependencies. In this case, the session request would be made as well since we are using it´s response value as part of our current request.

## License
Copyright 2017 David Sergio Díaz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
