var os = require('os')

var Stats = require('./stats')(os)

Stats.getBackend = function (type, log) {
  var Backend = null
  if (type === 'heka') {
    Backend = require('./heka')(require('heka'))
  }
  else if (type === 'statsd') {
    Backend = require('./statsd')(require('node-statsd').StatsD)
  }
  else if (type === 'log') {
    Backend = require('./log')(log)
  }
  else {
    Backend = require('./null')()
  }
  return Backend
}

module.exports = Stats
