/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const assert = require('insist')

describe('error', () => {
  it(
    'error module',
    () => {
      const error = require('../../lib/error')
      assert.equal(typeof error, 'function', 'error module returns a function')

      const duplicate = error.duplicate()
      assert.equal(typeof duplicate, 'object', 'duplicate returns an object')
      assert(duplicate instanceof error, 'is an instance of error')
      assert.equal(duplicate.code, 409)
      assert.equal(duplicate.errno, 101)
      assert.equal(duplicate.message, 'Record already exists')
      assert.equal(duplicate.error, 'Conflict')
      assert.equal(duplicate.toString(), 'Error: Record already exists')

      const notFound = error.notFound()
      assert.equal(typeof notFound, 'object', 'notFound returns an object')
      assert(notFound instanceof error, 'is an instance of error')
      assert.equal(notFound.code, 404)
      assert.equal(notFound.errno, 116)
      assert.equal(notFound.message, 'Not Found')
      assert.equal(notFound.error, 'Not Found')
      assert.equal(notFound.toString(), 'Error: Not Found')

      const err = new Error('Something broke.')
      err.code = 'ER_QUERY_INTERRUPTED'
      err.errno = 1317
      const wrap = error.wrap(err)
      assert.equal(typeof wrap, 'object', 'wrap returns an object')
      assert(wrap instanceof error, 'is an instance of error')
      assert.equal(wrap.code, 500)
      assert.equal(wrap.errno, 1317)
      assert.equal(wrap.message, 'ER_QUERY_INTERRUPTED')
      assert.equal(wrap.error, 'Internal Server Error')
      assert.equal(wrap.toString(), 'Error: ER_QUERY_INTERRUPTED')
    }
  )
})
