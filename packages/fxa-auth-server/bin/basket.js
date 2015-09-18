/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

This process reads fxa 'verified' and 'login' auth-server events and sends them
to the [basket API](https://github.com/mozilla/basket) for user engagement.

/*/

var request = require('request')
var config = require('../config').getProperties()
var log = require('../lib/log')(config.log.level, 'fxa-basket-sender')
var SQSReceiver = require('../lib/sqs')(log)

var messageHandlers = {
  verified: onVerified,
  login: onLogin
}

var basketQueue = new SQSReceiver(config.basket.region, [config.basket.queueUrl])
basketQueue.on(
  'data',
  function basketRequest(message) {
    log.trace({ op: 'basketRequest', sqs: message })

    var messageHandler = messageHandlers[message.event]
    if (messageHandler) {
      return messageHandler(message)
    }

    message.del()
  }
)
basketQueue.start()

function onVerified (message) {
  forwardEvent(message, '/fxa-register/', {
    fxa_id: message.uid,
    email: message.email,
    // Basket won't accept empty or null `accept_lang` field,
    // so we default to en-US.  This should only happen if
    // the user has not sent an explicit Accept-Language header.
    accept_lang: message.locale || 'en-US'
  }, 'form')
}

function onLogin (message) {
  forwardEvent(message, '/fxa-activity/', {
    activity: 'account.login',
    service: message.service,
    fxa_id: message.uid,
    first_device: message.deviceCount === 1,
    user_agent: message.userAgent
  }, 'json')
}

function forwardEvent (message, endpoint, data, dataFormat) {
  // Ignore email addresses that are clearly from dev testing.
  if (shouldIgnoreEmail(message.email)) {
    message.del()
    return
  }

  // Forward all others to basket API.
  var requestData = {
    url: config.basket.apiUrl + endpoint,
    strictSSL: true,
    method: 'POST',
    headers: {
      'X-API-Key': config.basket.apiKey
    }
  }
  requestData[dataFormat] = data
  request(requestData, function (err, res, body) {
    message.op = 'basketRequest'
    message.endpoint = endpoint

    // Log and retry for network-level errors.
    if (err) {
      message.err = err
      return log.error(message)
    }

    message.status = res.statusCode
    message.body = body

    // Log at error level for HTTP-level errors, info level otherwise.
    if (res.statusCode < 200 || res.statusCode >= 300) {
      log.error(message)
    } else {
      log.info(message)
    }

    message.del()
  })
}

function shouldIgnoreEmail (email) {
  if (email.match(/@restmail.net$/)) {
    return true
  }

  if (email.match(/@restmail.lcip.org$/)) {
    return true
  }

  return false
}

