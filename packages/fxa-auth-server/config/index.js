var fs = require('fs')
var path = require('path')
var url = require('url')
var convict = require('convict')

module.exports = require('./config')(fs, path, url, convict)
