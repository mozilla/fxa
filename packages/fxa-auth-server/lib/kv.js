var config = require('./config');
var kvstore = require('kvstore')(config);

module.exports = {
	cache: kvstore.connect({ backend: config.get('kvstore.cache') }),
	store: kvstore.connect({ backend: config.get('kvstore.backend' )})
};
