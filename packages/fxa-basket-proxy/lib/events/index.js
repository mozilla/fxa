/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var url = require('url');
var Promise = require('bluebird');
var basket = require('../basket');
var logger = require('../logging')('events');

var config = require('../config');

// Certain special values of the utm_campaign metrics parameters
// are used to indicate a newsletter campaign, and cause us to
// auto-subscribe the user to a particular newsletter.
var NEWSLETTER_CAMPAIGNS = config.get('basket.newsletter_campaigns');

var SOURCE_URL_BASE = config.get('basket.source_url');


var messageHandlers = {
  verified: onVerified,
  login: onLogin
};


module.exports.handleEvent = function handleEvent(message) {
  logger.info('handleEvent', message);
  var messageHandler = messageHandlers[message.event];
  if (messageHandler) {
    return messageHandler(message);
  } else {
    logger.info('handleEvent.ignored', message.event);
    return new Promise(function (cb) {
      message.del(cb);
    });
  }
};


/* eslint-disable camelcase */

// For each new verified account, register it with basket.
function onVerified (message) {
  return forwardEvent(message, '/fxa-register/', {
    fxa_id: message.uid,
    email: message.email,
    // Basket won't accept empty or null `accept_lang` field,
    // so we default to en-US.  This should only happen if
    // the user has not sent an explicit Accept-Language header.
    accept_lang: message.locale || 'en-US'
  }, 'form');
}

// For each new login, inform basket so it can build up a user model.
function onLogin (message, cb) {
  var metrics = message.metricsContext || {};
  return Promise.resolve().then(function () {
    // If utm_campaign indicates it's a newsletter campaign, flag it by
    // subscribing to the corresponding newsletter.
    var newsletter = NEWSLETTER_CAMPAIGNS[metrics.utm_campaign];
    if (metrics.utm_campaign && newsletter) {
      var source_url = url.parse(SOURCE_URL_BASE, true);
      for (var key in metrics) {
        if (key.indexOf('utm_') === 0) {
          source_url.query[key] = metrics[key];
        }
      }
      var params = {
        email: message.email,
        newsletters: newsletter,
        source_url: url.format(source_url)
      };
      logger.info('campaign-subscribe', params);
      return new Promise(function (resolve, reject) {
        var req = {
          method: 'post',
          form: params
        };
        basket.request('/subscribe/', req, function (err, res, body) {
          // Reject on network-level errors, causing the event to be retried.
          if (err) {
            message.err = err;
            logger.error('campaign-subscribe.error.network', message);
            return reject(err);
          }
          // If the request was received and understood by basket,
          // but got rejected, then log it and ignore.  There's no
          // point retrying it as we'd just get the same result again.
          if (res.statusCode < 200 || res.statusCode >= 300) {
            message.status = res.statusCode;
            message.body = body;
            logger.error('campaign-subscribe.error.http', message);
          }
          return resolve();
        });
      });
    }
  }).then(function () {
    // Pass on all logins to basket, for metrics and analysis purposes.
    return forwardEvent(message, '/fxa-activity/', {
      activity: 'account.login',
      service: message.service,
      fxa_id: message.uid,
      first_device: message.deviceCount === 1,
      user_agent: message.userAgent,
      metrics_context: metrics
    }, 'json');
  });
}

/* eslint-enable camelcase */

function forwardEvent (message, endpoint, data, dataFormat) {
  return new Promise(function (resolve, reject) {
    // Ignore email addresses that are clearly from dev testing.
    if (shouldIgnoreEmail(message.email)) {
      message.del(resolve);
      return;
    }

    // Forward all others to basket API.
    var options = { method: 'POST' };
    options[dataFormat] = data;
    basket.request(endpoint, options, function (err, res, body) {
      message.endpoint = endpoint;

      // Log network-level errors, and leave event in queue for retry.
      if (err) {
        message.err = err;
        logger.error('forward-event.error.network', message);
        return reject(err);
      }

      message.status = res.statusCode;
      message.body = body;

      // Log at error level for HTTP-level errors, info level otherwise.
      if (res.statusCode < 200 || res.statusCode >= 300) {
        logger.error('forward-event.error.http', message);
      } else {
        logger.info('forward-event', message);
      }

      message.del(resolve);
    });
  });
}


function shouldIgnoreEmail (email) {
  if (email.match(/@restmail.net$/)) {
    return true;
  }
  if (email.match(/@restmail.lcip.org$/)) {
    return true;
  }
  return false;
}
