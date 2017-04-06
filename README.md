<div align="center">
	<img src="http://files.martianwabbit.com/beau.png?1" height="144"/>
</div>

<h1 align="center">Beau</h1>
<p align="center">Testing JSON APIs made easy.</p>

## What is Beau?
Beau, is a CLI that executes HTTP requests based on a YAML configuration file. This makes testing easy, it allows you to share test requests with others as part of your repo.

![A Gif showing how beau works](http://files.martianwabbit.com/beau.gif)

## Installation
	npm install -g beau

## Usage
	 beau [options] -r <Request Alias>

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -r, --request [request]  The alias for the request you'd like to trigger.
    -v, --verbose            Show all the information related to the current request and it's response.
    -c, --config [file]      Specify your request config file. Defaults to beau.yml in the current directory.
    -l, --list               List all requests in the config file.
    -t, --truncate [length]  Truncate the content to the given length

## Example Configuration File

	version: 1
	host: https://example.com/api/

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
	beau -r profile

That would execute the profile request along with it´s dependencies. In this case, the session request would be made as well since we are using it´s response value as part of our current request.

## License
Copyright 2017 David Sergio Díaz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
