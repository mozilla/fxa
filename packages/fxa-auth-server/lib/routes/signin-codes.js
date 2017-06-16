/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const isA = require('joi')
const validators = require('./validators')

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').requiredSchema

module.exports = (log, db, customs) => {
  return [
    {
      method: 'POST',
      path: '/signinCodes/consume',
      config: {
        validate: {
          payload: {
            code: isA.string().regex(validators.URL_SAFE_BASE_64).required(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        },
        response: {
          schema: {
            email: validators.email().required()
          }
        }
      },
      handler (request, reply) {
        log.begin('signinCodes.consume', request)
        request.validateMetricsContext()

        customs.checkIpOnly(request, 'consumeSigninCode')
          .then(bufferizeSigninCode)
          .then(consumeSigninCode)
          .then(reply, reply)

        function bufferizeSigninCode () {
          let base64 = request.payload.code.replace(/-/g, '+').replace(/_/g, '/')

          const padCount = base64.length % 4
          for (let i = 0; i < padCount; ++i) {
            base64 += '='
          }

          return Buffer.from(base64, 'base64')
        }

        function consumeSigninCode (code) {
          return db.consumeSigninCode(code)
            .then(result => {
              return request.emitMetricsEvent('signinCode.consumed')
                .then(() => {
                  if (result.flowId) {
                    return request.emitMetricsEvent(`flow.continued.${result.flowId}`)
                  }
                })
                .then(() => result)
            })
        }
      }
    }
  ]
}

