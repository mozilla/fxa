/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var StatsD = require('node-statsd')

var STATSD_PREFIX = 'fxa.auth.'

function StatsDCollector(log) {
  if (! log) {
    throw new Error('Log is required')
  }

  var config = require('../../config')
  var statsdConfig = config.get('statsd')

  this.host = statsdConfig.host
  this.port = statsdConfig.port
  this.sampleRate = statsdConfig.sample_rate
  this.connected = false
  this.client = null
  this.log = log
}

StatsDCollector.prototype = {
  /**
   * Initializes a StatsD socket client
   */
  init: function () {
    var self = this
    var client = this.client = new StatsD(this.host, this.port)

    if (client.socket) {
      this.connected = true
      client.socket.on('error', function (error) {
        self.connected = false
        self.log.error({ op: 'statsd', err: error })
      })
    } else {
      self.log.error({ op: 'statsd', err: new Error('StatsD failed to connect to ' + this.host + ':' + this.port) })
      this.connected = false
    }

    if (! this.connected) {
      self.log.error({ op: 'statsd', err: new Error('StatsD not connected.') })
    }
  },

  /**
   * Send a formatted metrics object to StatsD
   *
   * @param {Object} info
   */
  write: function (info) {
    this.increment(info.event)
  },

  increment: function (name, tags) {
    var self = this

    if (self.client) {
      self.client.increment(STATSD_PREFIX + name, 1, self.sampleRate, tags, function messageSentCallback(err) {
        // this only gets called once after all messages have been sent
        if (err) {
          self.log.error({op: 'statsd', err: err})
        }
      })
    }
  },

  /**
   * Close the client
   */
  close: function () {
    if (this.client) {
      this.client.close()
      this.connected = false
    }
  }
}

module.exports = StatsDCollector
