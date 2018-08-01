/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')

const Hapi = require('hapi')

const config = require('../../config').getProperties()
const _configureSentry = require('../../lib/server')._configureSentry
const server = new Hapi.Server({})

describe('Sentry', () => {
  let sentryDsn

  beforeEach(() => {
    sentryDsn = config.sentryDsn
  })

  afterEach(() => {
    config.sentryDsn = sentryDsn
  })

  it('can be set up when sentry is enabled', () => {
    config.sentryDsn = 'https://deadbeef:deadbeef@127.0.0.1/123'
    assert.doesNotThrow(() => _configureSentry(server, config))
  })

  it('can be set up when sentry is not enabled', () => {
    assert.doesNotThrow(() => _configureSentry(server, config))
  })
})
