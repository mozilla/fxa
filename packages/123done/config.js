var configFile = process.env.CONFIG_123DONE || './config.json';
console.log('loading configuration File', configFile);
module.exports = require(configFile);

