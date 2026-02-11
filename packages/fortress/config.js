var path = require('path');

var configTarget = process.env.CONFIG_FORTRESS || './config.json';
var configFile = path.resolve(__dirname, configTarget);

var now = '[' + new Date().toISOString() + ']';
console.log(now, 'loading configuration File', configFile); //eslint-disable-line no-console

var config = require(configFile);
console.log(now, 'config:', JSON.stringify(config, null, 2)); //eslint-disable-line no-console

module.exports = config;
