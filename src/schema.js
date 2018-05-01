const Joi = require('joi');
const { requestRegex } = require('./shared.js');

const requestSchema = [
	Joi.object()
		.keys({
			HEADERS: Joi.object().keys(null),
			PAYLOAD: [Joi.object().keys(null), Joi.string()],
			PARAMS: Joi.object().keys(null),
			FORM: Joi.object().keys(null),
			ALIAS: Joi.string().required(),
			FORMDATA: Joi.object().keys(null)
		})
		.or('FORM', 'PAYLOAD', 'FORMDATA')
		.rename(/headers/i, 'HEADERS', { override: true })
		.rename(/payload/i, 'PAYLOAD', { override: true })
		.rename(/params/i, 'PARAMS', { override: true })
		.rename(/form/i, 'FORM', { override: true })
		.rename(/alias/i, 'ALIAS', { override: true }),

	Joi.string()
];

const hostSchema = Joi.object()
	.keys({
		HOST: Joi.string().required(),
		ENDPOINT: Joi.string(),
		DEFAULTS: Joi.object().keys(null)
	})
	.pattern(requestRegex, requestSchema)
	.rename(/host/i, 'HOST', { override: true })
	.rename(/defaults/i, 'DEFAULTS', { override: true })
	.rename(/endpoint/i, 'ENDPOINT', { override: true });

const schema = Joi.object()
	.keys({
		VERSION: Joi.number().integer(),
		ENDPOINT: Joi.string().uri(),
		PLUGINS: Joi.array().items([Joi.string(), Joi.object().keys(null)]),
		DEFAULTS: Joi.object(),
		ENVIRONMENT: Joi.object(),
		HOSTS: Joi.array().items(hostSchema),
		COOKIEJAR: Joi.boolean()
	})
	.pattern(requestRegex, requestSchema)
	.rename(/version/i, 'VERSION', { override: true })
	.rename(/endpoint/i, 'ENDPOINT', { override: true })
	.rename(/hosts/i, 'HOSTS', { override: true })
	.rename(/plugins/i, 'PLUGINS', { override: true })
	.rename(/defaults/i, 'DEFAULTS', { override: true })
	.rename(/environment/i, 'ENVIRONMENT', { override: true })
	.rename(/cookiejar/i, 'COOKIEJAR', { override: true });

const validate = function(config) {
	return Joi.validate(config, schema, { allowUnknown: true });
};

module.exports = { schema, validate };
