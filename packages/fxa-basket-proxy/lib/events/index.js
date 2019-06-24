/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const url = require('url');
const Promise = require('bluebird');
const basket = require('../basket');
const logger = require('../logging')('events');

const config = require('../config');

// Certain special values of the utm_campaign metrics parameters
// are used to indicate a newsletter campaign, and cause us to
// auto-subscribe the user to a particular newsletter.
const NEWSLETTER_CAMPAIGNS = config.get('basket.newsletter_campaigns');
const NEWSLETTER_ID_REGISTER = config.get('basket.newsletter_id_register');
const SOURCE_URL_BASE = config.get('basket.source_url');

const messageHandlers = (module.exports._messageHandlers = {
  verified: onVerified,
  login: onLogin,
});

const DISABLED_EVENT_TYPES = config.get('basket.sqs.disabled_event_types');
if (DISABLED_EVENT_TYPES) {
  DISABLED_EVENT_TYPES.forEach(typ => {
    delete messageHandlers[typ];
  });
}

const DISABLED_AFTER_TIMESTAMP = config.get(
  'basket.sqs.disabled_after_timestamp'
);

module.exports.handleEvent = function handleEvent(message) {
  logger.info('handleEvent', message);
  const messageHandler = messageHandlers[message.event];
  if (!messageHandler) {
    logger.info('handleEvent.ignored', message.event);
    return new Promise(function(cb) {
      message.del(cb);
    });
  }
  if (DISABLED_AFTER_TIMESTAMP && message.ts) {
    // Event timestamps are in seconds, config is in milliseconds.
    if (message.ts * 1000 >= DISABLED_AFTER_TIMESTAMP) {
      logger.info('handleEvent.disabledAfterTimestamp', message.event);
      return new Promise(function(cb) {
        message.del(cb);
      });
    }
  }
  return messageHandler(message);
};

/* eslint-disable camelcase */

// For each new verified account, register it with basket.
function onVerified(message) {
  // Ignore email addresses that are clearly from dev testing.
  if (shouldIgnoreEmail(message.email)) {
    message.del();
    return Promise.resolve();
  }

  const params = {
    fxa_id: message.uid,
    email: message.email,
    // Basket won't accept empty or null `accept_lang` field,
    // so we default to en-US.  This should only happen if
    // the user has not sent an explicit Accept-Language header.
    accept_lang: message.locale || 'en-US',
  };

  if (message.marketingOptIn) {
    return basketPromise(message, '/fxa-register/', params, 'form').then(
      function() {
        const metrics = message.metricsContext || {};
        // We don't look for a newsletter campaign this time around. We
        // specifically want to subcribe to the default newletter. If
        // there is a utm_campaign parameter, we'll hear about it in the
        // 'login' event later.
        const source_url = url.parse(SOURCE_URL_BASE, true);
        for (const key in metrics) {
          if (key.indexOf('utm_') === 0) {
            source_url.query[key] = metrics[key];
          }
        }
        const params = {
          email: message.email,
          newsletters: NEWSLETTER_ID_REGISTER,
          source_url: url.format(source_url),
        };
        return forwardEvent(message, '/subscribe/', params, 'form');
      }
    );
  } else {
    return forwardEvent(message, '/fxa-register/', params, 'form');
  }
}

// For each new login, inform basket so it can build up a user model.
function onLogin(message) {
  // Ignore email addresses that are clearly from dev testing.
  if (shouldIgnoreEmail(message.email)) {
    message.del();
    return Promise.resolve();
  }
  const metrics = message.metricsContext || {};
  return Promise.resolve()
    .then(function() {
      // If utm_campaign indicates it's a newsletter campaign, flag it by
      // subscribing to the corresponding newsletter.
      const newsletter = NEWSLETTER_CAMPAIGNS[metrics.utm_campaign];
      if (metrics.utm_campaign && newsletter) {
        const source_url = url.parse(SOURCE_URL_BASE, true);
        for (const key in metrics) {
          if (key.indexOf('utm_') === 0) {
            source_url.query[key] = metrics[key];
          }
        }
        const params = {
          email: message.email,
          newsletters: newsletter,
          source_url: url.format(source_url),
        };
        logger.info('campaign-subscribe', params);
        return basketPromise(message, '/subscribe/', params, 'form');
      }
    })
    .then(function() {
      // Pass on all logins to basket, for metrics and analysis purposes.
      return forwardEvent(
        message,
        '/fxa-activity/',
        {
          activity: 'account.login',
          service: message.service,
          fxa_id: message.uid,
          first_device: message.deviceCount === 1,
          user_agent: message.userAgent,
          metrics_context: metrics,
        },
        'json'
      );
    });
}

/* eslint-enable camelcase */

function forwardEvent(message, endpoint, data, dataFormat) {
  // Forward all others to basket API.
  return basketPromise(message, endpoint, data, dataFormat).then(function() {
    message.del();
  });
}

function basketPromise(message, endpoint, data, dataFormat) {
  return new Promise(function(resolve, reject) {
    const options = { method: 'POST' };
    options[dataFormat] = data;
    basket.request(endpoint, options, function(err, res, body) {
      message.endpoint = endpoint;
      // Log network-level errors, and leave event in queue for retry.
      if (err) {
        message.err = err;
        logger.error('event.request.error.network', message);
        return reject(err);
      }

      message.status = res.statusCode;
      message.body = body;

      // Log at error level for HTTP-level errors, info level otherwise.
      if (res.statusCode < 200 || res.statusCode >= 300) {
        logger.error('event.request.error.http', message);
      } else {
        logger.info('event.request', message);
      }
      resolve();
    });
  });
}

function shouldIgnoreEmail(email) {
  if (email.match(/@restmail.net$/)) {
    return true;
  }
  if (email.match(/@restmail.lcip.org$/)) {
    return true;
  }
  return false;
}
