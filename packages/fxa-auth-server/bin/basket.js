/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

This process reads fxa 'verified' auth-server events and sends them
to the [basket API](https://github.com/mozilla/basket) for user engagement.

/*/

var request = require('request')
var config = require('../config').root()
var log = require('../log')(config.log.level, 'basket')
var SQSReceiver = require('../sqs')(log)

var basketQueue = new SQSReceiver(config.basket.region, [config.basket.queueUrl])
basketQueue.on(
  'data',
  function basketRequest(message) {
    log.trace({ op: 'basketRequest', sqs: message })
    if (message.event === 'verified') {
      request(
        {
          url: config.basket.apiUrl + '/fxa-register/',
          strictSSL: true,
          method: 'POST',
          headers: {
            'X-API-Key': config.basket.apiKey
          },
          form: {
            fxa_id: message.uid,
            email: message.email,
            accept_lang: message.locale
          }
        },
        function (err, res, body) {
          // Log and retry for network-level errors.
          if (err) {
            log.error(
              {
                op: 'basketRequest',
                uid: message.uid,
                locale: message.locale,
                err: err
              }
            )
            return
          }
          // Log at error level for HTTP-level errors, info level otherwise.
          if (res.statusCode < 200 || res.statusCode >= 300) {
            log.error(
              {
                op: 'basketRequest',
                status: res.statusCode,
                uid: message.uid,
                locale: message.locale,
                body: body
              }
            )
          } else {
            log.info(
              {
                op: 'basketRequest',
                status: res.statusCode,
                locale: message.locale,
                body: body
              }
            )
          }
          message.del()
        }
      )
    }
    else {
      message.del()
    }
  }
)
basketQueue.start()
