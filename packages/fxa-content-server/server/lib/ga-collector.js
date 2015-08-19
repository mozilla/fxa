/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var extend = require('extend');
var universalAnalytics = require('universal-analytics');
var logger = require('mozlog')('server.ga');
var config = require('./configuration');

var PUBLIC_URL = config.get('public_url');
var ANALYTICS_ID = config.get('google_analytics_id');
var SIGNUP_FLOW = 'Firefox Accounts Sign-up Flow';

// note: if you use labels (el), then a value must be present (ev).
// See more details at http://event-tracking.com/ and
// https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
var GA_EVENTS = {
  'screen.signup': {
    ec: SIGNUP_FLOW,
    ea: 'page load',
    el: 'Sign Up Page',
    ev: 1
  },
  'signup.success': {
    ec: SIGNUP_FLOW,
    ea: 'registered',
    el: 'regular',
    ev: 1
  },
  'oauth.signup.success': {
    ec: SIGNUP_FLOW,
    ea: 'registered',
    el: 'oauth',
    ev: 1
  },
  'verify-email.verification.success': {
    ec: SIGNUP_FLOW,
    ea: 'verified email address'
  }
};

function GACollector(options) {
  options = options || {};

  this.analyticsId = options.analyticsId || ANALYTICS_ID;
}

GACollector.prototype = {
  /**
   * Send a formatted metrics object to Google Analytics
   *
   * @param {Object} body
   */
  write: function (body) {
    if (! body || ! body.events || ! body.events.length > 0 || ! this.analyticsId) {
      return;
    }

    var self = this;
    var visitor = universalAnalytics(ANALYTICS_ID, { https: true, debug: false });

    body.events.forEach(function (event) {
      if (event.type && GA_EVENTS[event.type]) {
        var gaEvent = GA_EVENTS[event.type];

        // see https://github.com/peaksandpies/universal-analytics/blob/master/AcceptableParams.md
        // for available list of parameters
        var gaData = {
          anonymizeIp: 1,
          campaignMedium: body.utm_medium,
          campaignName: body.utm_campaign,
          campaignSource: body.utm_source,
          cid: body.uniqueUserId,
          dataSource: 'web',
          documentHostName: PUBLIC_URL,
          documentReferrer: body.referrer,
          // it is important to set geoid to NOTSET to avoid ip tracking
          geoid: 'NOTSET',
          hitType: 'event',
          ua: body.agent,
          uid: body.uniqueUserId,
          ul: body.lang
        };

        gaData.qt = self._calculateQueueTime(body.startTime, body.flushTime, event.offset);

        if (body.screen) {
          var screen = body.screen;

          // screen resolution and viewport parameter
          // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters?hl=en#sr
          if (screen.width && screen.height) {
            gaData.sr = screen.width + 'x' + screen.height;
          }

          if (screen.clientWidth && screen.clientHeight) {
            gaData.vp = screen.clientWidth + 'x' + screen.clientHeight;
          }
        }

        extend(gaEvent, gaData);

        visitor.event(gaEvent).send(function (err) {
          if (err) {
            logger.error('Error in GA collector: ', err);
          }
        });
      }
    });
  },
  /**
   * Calculate the queue time of the event.
   * See https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters?hl=en#qt
   *
   * @param {Number} startTime
   *  The time from which all offsets are calculated in the front-end metrics.
   * @param {Number} flushTime
   *  The time when the events were flushed and sent to the server in the front-end metrics.
   * @param {Number} offset
   *  Offset of the event since metrics start
   *
   * @returns {Number}
   *  The time delta (in milliseconds) between when the hit being reported occurred and the time the hit was sent.
   *
   * @private
   */
  _calculateQueueTime: function (startTime, flushTime, offset) {
    if (! startTime || ! flushTime || ! offset) {
      return 0;
    }

    var offsetTime = startTime + offset;

    return Math.max(0, flushTime - offsetTime);
  }
};

module.exports = GACollector;
