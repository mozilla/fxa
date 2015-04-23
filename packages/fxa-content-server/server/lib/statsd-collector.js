/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var logger = require('mozlog')('server.statsd');
var StatsD = require('node-statsd');
var uaParser = require('ua-parser');

var STATSD_PREFIX = 'fxa.content.';

function StatsDCollector() {
  var config = require('./configuration');
  var statsdConfig = config.get('statsd');

  this.host = statsdConfig.host;
  this.port = statsdConfig.port;
  this.sampleRate = statsdConfig.sample_rate;
  this.connected = false;
  this.client = null;
}

StatsDCollector.prototype = {
  /**
   * Initializes a StatsD socket client
   */
  init: function () {
    var client = this.client = new StatsD(this.host, this.port);

    if (client.socket) {
      this.connected = true;
      client.socket.on('error', function (error) {
        logger.error('Error in stats socket: ', error);
      });
    } else {
      logger.error('StatsD failed to connect to ' + this.host + ':' + this.port);
      this.connected = false;
    }

    if (! this.connected) {
      logger.error('StatsD not connected.');
    }
  },
  /**
   * Send a formatted metrics object to StatsD
   *
   * @param {Object} body
   */
  write: function (body) {
    /*jshint maxcomplexity:8 */
    var self = this;
    var client = self.client;

    if (body && this.connected && body.events && body.events.length > 0) {
      // see more about tags here: http://docs.datadoghq.com/guides/metrics/
      var tags = [
        'campaign:' + body.campaign,
        'context:' + body.context,
        'entrypoint:' + body.entrypoint,
        'migration:' + body.migration,
        'lang:' + body.lang,
        'marketing_clicked:' + body.marketingClicked,
        'marketing_link:' + body.marketingLink,
        'marketing_type:' + body.marketingType,
        'service:' + body.service
      ];

      if (body.screen) {
        var screen = body.screen;

        tags = tags.concat([
          'screen_client_width:' + screen.clientWidth,
          'screen_client_height:' + screen.clientHeight,
          'screen_device_pixel_ratio:' + screen.devicePixelRatio,
          'screen_width:' + screen.width,
          'screen_height:' + screen.height
        ]);
      }

      if (body.agent) {
        var agent = uaParser.parse(body.agent);
        if (agent) {
          if (agent.ua) {
            tags = tags.concat([
              'agent_ua_name:' + agent.ua.toString(), // -> "Safari 5.0.1"
              'agent_ua_family:' + agent.ua.family, // -> "Safari"
              'agent_ua_version:' + agent.ua.toVersionString(), // -> "5.0.1"
              'agent_ua_version_major:' + agent.ua.major // -> "5"
            ]);
          }

          if (agent.os) {
            tags = tags.concat([
              'agent_os_name:' + agent.os.toString(), // -> "iOS 5.1"
              'agent_os_version:' + agent.os.toVersionString(), // -> "5.1"
              'agent_os_family:' + agent.os.family, // -> "iOS"
              'agent_os_major:' + agent.os.major // -> "5"
            ]);
          }

          if (agent.device) {
            tags = tags.concat([
              'agent_device:' + agent.device.family // -> "iPhone"
            ]);
          }
        }
      }

      body.events.forEach(function (event) {
        if (event.type) {
          client.increment(STATSD_PREFIX + event.type, 1, self.sampleRate, tags, function (err) {
            //this only gets called once after all messages have been sent
            if (err) {
              logger.error('StatsD error:', err);
            }
          });
        }

      });
    }

  },
  /**
   * Close the client
   */
  close: function () {
    if (this.client) {
      this.client.close();
      this.connected = false;
    }
  }
};

module.exports = StatsDCollector;
