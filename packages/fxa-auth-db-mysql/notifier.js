/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var url = require('url')
var request = require('request')
var P = require('./promise')
var JWK = require('fxa-jwtool').JWK

module.exports = function (log, config) {

  var secretPem = fs.readFileSync(
    path.resolve(__dirname, config.notifications.jwt.secretKeyFile),
    'utf8'
  )

  var secretKey = JWK.fromPEM(
    secretPem,
    {
      alg: 'RS256',
      kid: config.notifications.jwt.kid,
      jku: config.notifications.jwt.jku,
      iss: config.notifications.jwt.iss
    }
  )

  var aud = url.parse(config.notifications.publishUrl).host

  function publish(events) {
    return P.resolve(events)
      // Convert each event into a signed JWT.
      .map(function (evt) {
        return secretKey.sign({
          aud: aud,
          iat: evt.iat,
          typ: evt.typ,
          uid: evt.uid
        })
      })
      // Post them to the notification server.
      .then(function (jwts) {
        return new P(function (resolve, reject) {
          request.post({
            url: config.notifications.publishUrl,
            json: {
              events: jwts
            }
          }, function(err, resp) {
            if (err) {
              log.error({ op: 'Notifier.publishErr', err: err })
              return reject(err)
            }
            if (resp.statusCode >= 400) {
              log.error({ op: 'Notifier.publishErr', err: resp })
              return reject(resp)
            }
            log.debug({ op: 'Notifier.publish' })
            resolve(events.length)
          })
        })
      })
  }

  return {
    publish: publish
  }

}
