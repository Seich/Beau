module.exports = function(name) {
	return function(settings) {
		let response = {
			name: `${name}`,
			preRequest(request) {
				request.wasModified = true;

				return request;
			},

			postResponse(response) {
				response.changed = true;
				return response;
			}
		};

		return response;
	};
};
