var P = require('p-promise')
var kvstore = require('kvstore')

module.exports = require('./kv')(P, kvstore)
