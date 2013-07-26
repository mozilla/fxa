var crypto = require('crypto')
var bigint = require('bigint')
var P = require('p-promise')
var hkdf = require('../hkdf')

module.exports = require('./bundle')(crypto, bigint, P, hkdf)
