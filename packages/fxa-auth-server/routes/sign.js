/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, error, signer, Account) {

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
              n: isA.String().with('e').without('y','p','q','g'),
              e: isA.String().with('n').without('y','p','q','g'),
              y: isA.String().with('p','q','g').without('n','e'),
              p: isA.String().with('y','q','g').without('n','e'),
              q: isA.String().with('y','p','g').without('n','e'),
              g: isA.String().with('y','p','q').without('n','e')
            }),
            duration: isA.Number().integer().min(0).max(24 * HOUR).required()
          }
        },
        handler: function certificateSign(request) {
          var uid = request.auth.credentials.uid
          Account
            .get(uid)
            .done(
              function (account) {
                if (!account.verified) {
                  return request.reply(error.unverifiedAccount())
                }
                signer.enqueue(
                  {
                    email: Account.principal(uid),
                    publicKey: JSON.stringify(request.payload.publicKey),
                    duration: request.payload.duration
                  },
                  function (err, result) {
                    if (err || result.err) {
                      request.reply(
                        error.internal(
                          'Unable to sign certificate',
                          err || result.err
                        )
                      )
                    }
                    else {
                      request.reply(result)
                    }
                  }
                )
              }
            )
        }
      }
    }
  ]

  return routes
}
