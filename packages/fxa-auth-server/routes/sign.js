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
        validate: {
          payload: {
            publicKey: isA.object({
              algorithm: isA.string().valid("RS", "DS").required(),
              n: isA.string(),
              e: isA.string(),
              y: isA.string(),
              p: isA.string(),
              q: isA.string(),
              g: isA.string(),
              version: isA.string()
            }).required(),
            duration: isA.number().integer().min(0).max(24 * HOUR).required()
          }
        }
      },
      handler: function certificateSign(request, reply) {
        log.begin('Sign.cert', request)
        var sessionToken = request.auth.credentials
        var publicKey = request.payload.publicKey
        var duration = request.payload.duration

        if (!sessionToken.emailVerified) {
          return reply(error.unverifiedAccount())
        }

        if (publicKey.algorithm === 'RS') {
          if (!publicKey.n) {
            return reply(error.missingRequestParameter('n'))
          }
          if (!publicKey.e) {
            return reply(error.missingRequestParameter('e'))
          }
        }
        else { // DS
          if (!publicKey.y) {
            return reply(error.missingRequestParameter('y'))
          }
          if (!publicKey.p) {
            return reply(error.missingRequestParameter('p'))
          }
          if (!publicKey.q) {
            return reply(error.missingRequestParameter('q'))
          }
          if (!publicKey.g) {
            return reply(error.missingRequestParameter('g'))
          }
        }

        signer.enqueue(
          {
            email: sessionToken.uid.toString('hex') + '@' + domain,
            publicKey: publicKey,
            duration: duration,
            generation: sessionToken.verifierSetAt,
            lastAuthAt: sessionToken.lastAuthAt()
          },
          function (err, result) {
            if (err) {
              log.error({ op: 'signer.enqueue', err: err, result: result })
              reply(error.serviceUnavailable())
            }
            else if (result && result.err) {
              // TODO: parse result.err better
              log.warn({ op: 'signer.enqueue', err: result.err })
              reply(error.wrap(result.err))
            }
            else {
              reply(result)
            }
          }
        )
      }
    }
  ]

  return routes
}
