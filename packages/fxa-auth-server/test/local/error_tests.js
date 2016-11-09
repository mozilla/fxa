/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')
var messages = require('joi/lib/language')
var AppError = require('../../lib/error')

describe('AppErrors', () => {

  it(
    'tightly-coupled joi message hack is okay',
    () => {
      assert.equal(typeof messages.errors.any.required, 'string')
      assert.notEqual(messages.errors.any.required, '')
    }
  )

  it(
    'exported functions exist',
    () => {
      assert.equal(typeof AppError, 'function')
      assert.equal(AppError.length, 3)
      assert.equal(typeof AppError.translate, 'function')
      assert.equal(AppError.translate.length, 1)
      assert.equal(typeof AppError.invalidRequestParameter, 'function')
      assert.equal(AppError.invalidRequestParameter.length, 1)
      assert.equal(typeof AppError.missingRequestParameter, 'function')
      assert.equal(AppError.missingRequestParameter.length, 1)
    }
  )

  it(
    'should translate with missing required parameters',
    () => {
      var result = AppError.translate({
        output: {
          payload: {
            message: 'foo' + messages.errors.any.required,
            validation: {
              keys: [ 'bar', 'baz' ]
            }
          }
        }
      })
      assert.ok(result instanceof AppError, 'instanceof AppError')
      assert.equal(result.errno, 108)
      assert.equal(result.message, 'Missing parameter in request body: bar')
      assert.equal(result.output.statusCode, 400)
      assert.equal(result.output.payload.error, 'Bad Request')
      assert.equal(result.output.payload.errno, result.errno)
      assert.equal(result.output.payload.message, result.message)
      assert.equal(result.output.payload.param, 'bar')
    }
  )

  it(
    'should translate with invalid parameter',
    () => {
      var result = AppError.translate({
        output: {
          payload: {
            validation: 'foo'
          }
        }
      })
      assert.ok(result instanceof AppError, 'instanceof AppError')
      assert.equal(result.errno, 107)
      assert.equal(result.message, 'Invalid parameter in request body')
      assert.equal(result.output.statusCode, 400)
      assert.equal(result.output.payload.error, 'Bad Request')
      assert.equal(result.output.payload.errno, result.errno)
      assert.equal(result.output.payload.message, result.message)
      assert.equal(result.output.payload.validation, 'foo')
    }
  )

  it(
    'tooManyRequests',
    () => {
      var result = AppError.tooManyRequests(900, 'in 15 minutes')
      assert.ok(result instanceof AppError, 'instanceof AppError')
      assert.equal(result.errno, 114)
      assert.equal(result.message, 'Client has sent too many requests')
      assert.equal(result.output.statusCode, 429)
      assert.equal(result.output.payload.error, 'Too Many Requests')
      assert.equal(result.output.payload.retryAfter, 900)
      assert.equal(result.output.payload.retryAfterLocalized, 'in 15 minutes')

      result = AppError.tooManyRequests(900)
      assert.equal(result.output.payload.retryAfter, 900)
      assert(!result.output.payload.retryAfterLocalized)

    }
  )
})
