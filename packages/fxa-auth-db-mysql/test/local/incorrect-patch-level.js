/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const assert = require('insist')
const dbServer = require('../../db-server')
const log = require('../lib/log')
const DB = require('../../lib/db/mysql')(log, dbServer.errors)
const config = require('../../config')
const patch = require('../../lib/db/patch')


describe('DB patch', () => {

  let originalPatch
  before(() => {
    originalPatch = patch.level
    patch.level = 1000000
  })

  it('should error with incorrect patchVersion', () => {
    return DB.connect(config)
      .then(
        db => {
          assert(false, 'DB.connect should have failed on an incorrect patchVersion')
        },
        err => {
          assert.equal(typeof err, 'object')
          assert(err instanceof Error)
          assert.equal(err.message, 'dbIncorrectPatchLevel')
        }
      )
  })

  after(() => {
    patch.level = originalPatch
  })

})
