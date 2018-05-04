function Request(request) {
    if (Request.fail) {
        throw new Error();
    }

    return {
        request: {
            headers: request.headers,
            body: request.body,
            uri: {
                href: `${request.baseUrl}${request.uri}`
            }
        },
        statusCode: 200,
        headers: [],
        body: '{"hello": "world"}'
    };
}

Request.fail = false;

module.exports = Request;
