/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const assert = require('insist')

const base32 = require('../../lib/db/random')

describe('random', () => {
  it('should generate random code', () => {
    return base32(10)
      .then(code => {
        assert.equal(code.length, 10)
        assert.equal(code.indexOf('i'), -1, 'should not contain i')
        assert.equal(code.indexOf('l'), -1, 'should not contain l')
        assert.equal(code.indexOf('o'), -1, 'should not contain o')
        assert.equal(code.indexOf('u'), -1, 'should not contain u')
      })
  })
})
