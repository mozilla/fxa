var path = require('path')
var Hapi = require('hapi')
var toobusy = require('toobusy')

module.exports = require('./server')(path, Hapi, toobusy)
