class Modifiers {
	constructor(registry, settings = {}) {
		registry.addPreRequestModifier(this.preRequest);
		registry.addPostRequestModifier(this.postRequest);
	}

	preRequest(request, orig) {
		request.headers.preRequestModifier = true;
		return request;
	}

	postRequest(response, orig) {
		response.body = 'Hello World';
		response.response.body = 'Hello World';
		return response;
	}
}

module.exports = Modifiers;
