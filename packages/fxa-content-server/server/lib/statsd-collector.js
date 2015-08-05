/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var logger = require('mozlog')('server.statsd');
var StatsD = require('node-statsd');
var uaParser = require('ua-parser');

var STATSD_PREFIX = 'fxa.content.';
var TIMING_POSTFIX = '.time';
var TIMED_EVENTS = [
  'signin.success',
  'signup.success',
  'oauth.signin.success',
  'oauth.signup.success'
];

/**
 * Normalize the string to make it usable in StatsD tagging.
 * @param {String} item
 * @returns {String}
 * @private
 */
function _normalizeTag(item) {
  return String(item).replace(/ /g, '_').toLowerCase();
}

function getGenericTags(body) {
  // see more about tags here: http://docs.datadoghq.com/guides/metrics/
  var tags = [
    'campaign:' + body.campaign,
    'context:' + body.context,
    'broker:' + body.broker,
    'entrypoint:' + body.entrypoint,
    'migration:' + body.migration,
    'lang:' + body.lang,
    'service:' + body.service
  ];

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

  // collect AB choices
  if (body.ab) {
    var abTags = [];

    body.ab.forEach(function (item) {
      if (item.event && item.event === 'choice' && item.experiment && item.choice) {
        var tagName = 'ab_' + _normalizeTag(item.experiment);
        var hadChoice = false;

        Object.keys(item.choice).forEach(function (choiceKey) {
          hadChoice = true;
          tagName += '_' + _normalizeTag(choiceKey);
          tagName += ':' + _normalizeTag(item.choice[choiceKey]);
        });

        // only add unique values
        if (hadChoice && abTags.indexOf(tagName) === -1) {
          abTags.push(tagName);
        }
      }
    });

    tags = tags.concat(abTags);
  }

  return tags;
}

function messageSentCallback (err) {
  // this only gets called once after all messages have been sent
  if (err) {
    logger.error('StatsD error:', err);
  }
}

function isTimedEvent (event) {
  return TIMED_EVENTS.indexOf(event) >= 0;
}

function getImpressionTags(impression) {
  return [
    'marketing_campaign_id:' + impression.campaignId,
    'marketing_url:' + impression.url,
    'marketing_clicked:' + impression.clicked
  ];
}

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
    var self = this;

    if (body && this.connected) {
      var tags = getGenericTags(body);

      if (body.events && body.events.length > 0) {
        body.events.forEach(function (event) {
          if (event.type) {
            self.increment(event.type, tags);
            if (isTimedEvent(event.type)) {
              self.timing(event.type, event.offset, tags);
            }

          }
        });
      }

      if (body.marketing && body.marketing.length > 0) {
        body.marketing.forEach(function (impression) {
          if (impression.campaignId && impression.url) {
            var impressionTags = tags.concat(getImpressionTags(impression));

            self.increment('marketing.impression', impressionTags);
          }
        });
      }
    }
  },

  increment: function (name, tags) {
    this.client.increment(STATSD_PREFIX + name, 1, this.sampleRate, tags, messageSentCallback);
  },

  /**
   * Sends the metrics timing offset value in milliseconds
   * @param {String} name The metric event name
   * @param {String} value Timing value in milliseconds from loading the page
   * @param {Array} tags
   */
  timing: function (name, value, tags) {
    this.client.timing(STATSD_PREFIX + name + TIMING_POSTFIX, value, this.sampleRate, tags, messageSentCallback);
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
