/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var messages = require('joi/lib/language')
var AppError = require('../../lib/error')

test(
  'tightly-coupled joi message hack is okay',
  function (t) {
    t.equal(typeof messages.errors.any.required, 'string')
    t.not(messages.errors.any.required, '')
    t.end()
  }
)

test(
  'exported functions exist',
  function (t) {
    t.equal(typeof AppError, 'function')
    t.equal(AppError.length, 3)
    t.equal(typeof AppError.translate, 'function')
    t.equal(AppError.translate.length, 1)
    t.equal(typeof AppError.invalidRequestParameter, 'function')
    t.equal(AppError.invalidRequestParameter.length, 1)
    t.equal(typeof AppError.missingRequestParameter, 'function')
    t.equal(AppError.missingRequestParameter.length, 1)
    t.end()
  }
)

test(
  'error.translate with missing required parameters',
  function (t) {
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
    t.ok(result instanceof AppError, 'instanceof AppError')
    t.equal(result.errno, 108)
    t.equal(result.message, 'Missing parameter in request body: bar')
    t.equal(result.output.statusCode, 400)
    t.equal(result.output.payload.error, 'Bad Request')
    t.equal(result.output.payload.errno, result.errno)
    t.equal(result.output.payload.message, result.message)
    t.equal(result.output.payload.param, 'bar')
    t.end()
  }
)

test(
  'error.translate with invalid parameter',
  function (t) {
    var result = AppError.translate({
      output: {
        payload: {
          validation: 'foo'
        }
      }
    })
    t.ok(result instanceof AppError, 'instanceof AppError')
    t.equal(result.errno, 107)
    t.equal(result.message, 'Invalid parameter in request body')
    t.equal(result.output.statusCode, 400)
    t.equal(result.output.payload.error, 'Bad Request')
    t.equal(result.output.payload.errno, result.errno)
    t.equal(result.output.payload.message, result.message)
    t.equal(result.output.payload.validation, 'foo')
    t.end()
  }
)

