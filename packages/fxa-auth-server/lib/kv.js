var config = require('./config');
var kvstore = require('kvstore')(config.root());

module.exports = {
	cache: kvstore.connect({ backend: config.get('kvstore.cache') }),
	store: kvstore.connect({ backend: config.get('kvstore.backend' )})
};
