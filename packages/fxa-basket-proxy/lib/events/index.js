/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Promise = require('bluebird');
var basket = require('../basket');
var logger = require('../logging')('events');

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
  return forwardEvent(message, '/fxa-activity/', {
    activity: 'account.login',
    service: message.service,
    fxa_id: message.uid,
    first_device: message.deviceCount === 1,
    user_agent: message.userAgent
  }, 'json');
}

/* eslint-enable camelcase */

function forwardEvent (message, endpoint, data, dataFormat) {
  return new Promise(function (cb) {
    // Ignore email addresses that are clearly from dev testing.
    if (shouldIgnoreEmail(message.email)) {
      message.del(cb);
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
        return cb();
      }

      message.status = res.statusCode;
      message.body = body;

      // Log at error level for HTTP-level errors, info level otherwise.
      if (res.statusCode < 200 || res.statusCode >= 300) {
        logger.error('forward-event.error.http', message);
      } else {
        logger.info('forward-event', message);
      }

      message.del(cb);
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
