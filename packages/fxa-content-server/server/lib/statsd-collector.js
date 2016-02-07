/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var logger = require('mozlog')('server.statsd');
var StatsD = require('node-statsd');
var uaParser = require('ua-parser');

// An arbitrary choice of 2 minutes. Nothing scientific, it just seems
// pages can be reasonably expected to load in under 2 minutes.
var NAVIGATION_TIMING_MAX_OFFSET = 2 * 60 * 1000;
var USER_ACTION_MAX_OFFSET = Infinity;

var STATSD_PREFIX = 'fxa.content.';
var TIMING_POSTFIX = '.time';
var TIMED_EVENTS = [
  'loaded',
  'oauth.signin.success',
  'oauth.signup.success',
  'signin.success',
  'signup.success'
];

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
          'agent_ua_family:' + agent.ua.family, // -> "Safari"
          'agent_ua_version:' + agent.ua.toVersionString(), // -> "5.0.1"
          'agent_ua_version_major:' + agent.ua.major // -> "5"
        ]);
      }

      if (agent.os) {
        tags = tags.concat([
          'agent_os_version:' + agent.os.toVersionString(), // -> "5.1"
          'agent_os_family:' + agent.os.family, // -> "iOS"
          'agent_os_major:' + agent.os.major // -> "5"
        ]);
      }

    }
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

function isEventOffsetValid(value) {
  return typeof value === 'number';
}

function isEventOffsetInRange(value, min, max) {
  return value >= min && value <= max;
}

function logOutOfRangeOffset(type, offset, min, max) {
  logger.error('Out of range (%s): %s [%s, %s]',
      type, offset, min, max);
}


function getImpressionTags(impression) {
  return [
    'marketing_campaign_id:' + impression.campaignId,
    'marketing_url:' + impression.url,
    'marketing_clicked:' + impression.clicked
  ];
}

function sendEvents(context, events, tags) {
  if (events && events.length > 0) {
    events.forEach(function (event) {
      var type = event.type;
      if (type) {
        context.increment(type, tags);

        var offset = event.offset;
        if (isTimedEvent(type) && isEventOffsetValid(offset)) {
          if (isEventOffsetInRange(offset, 0, USER_ACTION_MAX_OFFSET)) {
            context.timing(type, offset, tags);
          } else {
            logOutOfRangeOffset(type, offset, 0, USER_ACTION_MAX_OFFSET);
          }
        }
      }
    });
  }
}

function sendMarketingImpressions(context, marketing, tags) {
  if (marketing && marketing.length > 0) {
    marketing.forEach(function (impression) {
      if (impression.campaignId && impression.url) {
        var impressionTags = tags.concat(getImpressionTags(impression));
        context.increment('marketing.impression', impressionTags);
      }
    });
  }
}


function sendNavigationTiming(context, navigationTiming, tags) {
  if (navigationTiming) {
    for (var key in navigationTiming) {
      var offset = navigationTiming[key];

      if (isEventOffsetValid(offset)) {
        var type = 'navigationTiming.' + key;

        if (isEventOffsetInRange(offset, 0, NAVIGATION_TIMING_MAX_OFFSET)) {
          context.timing(type, offset, tags);
        } else {
          logOutOfRangeOffset(type, offset, 0, NAVIGATION_TIMING_MAX_OFFSET);
        }
      }
    }
  }
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
    if (body && this.connected) {
      var tags = getGenericTags(body);

      sendEvents(this, body.events, tags);
      sendMarketingImpressions(this, body.marketing, tags);
      sendNavigationTiming(this, body.navigationTiming, tags);
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
