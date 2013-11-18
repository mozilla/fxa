/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, isA, error, signer, domain) {

  const HOUR = 1000 * 60 * 60

  var routes = [
    {
      method: 'POST',
      path: '/certificate/sign',
      config: {
        auth: {
          strategy: 'sessionToken',
          payload: 'required'
        },
        tags: ["account"],
        validate: {
          payload: {
            publicKey: isA.Object({
              algorithm: isA.String().valid("RS", "DS").required(),
              n: isA.String(),
              e: isA.String(),
              y: isA.String(),
              p: isA.String(),
              q: isA.String(),
              g: isA.String(),
              version: isA.String()
            }).required(),
            duration: isA.Number().integer().min(0).max(24 * HOUR).required()
          }
        },
        handler: function certificateSign(request) {
          log.begin('Sign.cert', request)
          var sessionToken = request.auth.credentials
          var publicKey = request.payload.publicKey
          var duration = request.payload.duration

          if (!sessionToken.verified) {
            return request.reply(error.unverifiedAccount())
          }

          if (publicKey.algorithm === 'RS') {
            if (!publicKey.n) {
              return request.reply(error.missingRequestParameter('n'))
            }
            if (!publicKey.e) {
              return request.reply(error.missingRequestParameter('e'))
            }
          }
          else { // DS
            if (!publicKey.y) {
              return request.reply(error.missingRequestParameter('y'))
            }
            if (!publicKey.p) {
              return request.reply(error.missingRequestParameter('p'))
            }
            if (!publicKey.q) {
              return request.reply(error.missingRequestParameter('q'))
            }
            if (!publicKey.g) {
              return request.reply(error.missingRequestParameter('g'))
            }
          }

          signer.enqueue(
            {
              uid: sessionToken.uid,
              email: Buffer(sessionToken.email, 'hex').toString(),
              publicKey: publicKey,
              duration: duration
            },
            function (err, result) {
              if (err) {
                log.error({ op: 'signer.enqueue', err: err, result: result })
                request.reply(error.serviceUnavailable())
              }
              else if (result && result.err) {
                // TODO: parse result.err better
                log.warn({ op: 'signer.enqueue', err: result.err })
                request.reply(error.wrap(result.err))
              }
              else {
                request.reply(result)
              }
            }
          )
        }
      }
    }
  ]

  return routes
}
