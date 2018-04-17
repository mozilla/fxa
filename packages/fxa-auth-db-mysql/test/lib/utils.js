/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const dbUtils = require('../../lib/db/util')
const assert = require('insist')
const P = require('bluebird')

describe('utils', () => {
  it('createHashScrypt', () => {
    const input = 'somethingcool'
    return dbUtils.createHashScrypt(input)
      .then((result) => {
        assert.ok(result.hash, 'hash exists')
        assert.ok(result.salt, 'salt exists')
        assert.equal(result.hash.length, 32)
        assert.equal(result.salt.length, 32)
      })
  })

  describe('compareHashScrypt', () => {
    const inputA = 'thing1', inputB = 'thing2'
    let resultA, resultB

    before(() => {
      return P.all([dbUtils.createHashScrypt(inputA), dbUtils.createHashScrypt(inputB)])
        .spread((hashA, hashB) => {
          resultA = hashA
          resultB = hashB
        })
    })

    it('should fail for different input', () => {
      return dbUtils.compareHashScrypt(inputA, resultB.hash, resultB.salt)
        .then((result) => {
          assert.equal(result, false, 'strings do not match')
          return dbUtils.compareHashScrypt(inputB, resultA.hash, resultA.salt)
        })
        .then((result) => {
          assert.equal(result, false, 'strings do not match')
        })
    })

    it('should succeed for same input', () => {
      return dbUtils.compareHashScrypt(inputA, resultA.hash, resultA.salt)
        .then((result) => {
          assert.equal(result, true, 'strings do match')
        })
    })
  })

  describe('generateRecoveryCodes', () => {
    const codeLength = 10, codeCount = 5, keyspace = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let codes
    before(() => {
      return dbUtils.generateRecoveryCodes(codeCount, keyspace, codeLength)
        .then((result) => codes = result)
    })

    it('should not fail for empty keyspace', () => {
      return dbUtils.generateRecoveryCodes(1, '', 1)
        .then((result) => {
          assert.equal(result[0], '')
        })
    })

    it('should generate correct count of codes', () => {
      assert.equal(codes.length, codeCount, 'correct number of codees generated')
    })

    it('should generate correct length of code', () => {
      codes.forEach((code) => {
        assert.equal(code.length, codeLength, 'code is correct length')
      })
    })

    it('should generate code in keyspace', () => {
      const reg = /[a-z0-9]/
      codes.forEach((code) => {
        assert.equal(reg.test(code), true, 'code is in correct keyspace')
      })
    })
  })
})