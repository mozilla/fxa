var configFile = process.env.CONFIG_123DONE || './config.json';
console.log('loading configuration File', configFile);  //eslint-disable-line no-console
module.exports = require(configFile);

