/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const P = require('bluebird')
const test = require('tap').test

const config = {}
const mc = {}
const log = {
  info() {},
  error() {}
}
const Settings = require('../../lib/settings/settings')(config, mc, log)

class TestSettings extends Settings {
  constructor() {
    super('tests')
  }

  setAll(settings) {
    this.testOption = !!settings.testOption
    return this
  }

  validate(other) {
    if (!other) {
      throw new Settings.Missing()
    }
    return other
  }
}

test(
  'refresh without pushOnMissing does not call push',
  t => {
    let pushed
    mc.getAsync = () => P.resolve(pushed)
    mc.setAsync = (key, val) => {
      pushed = val
      return P.resolve(val)
    }
    const settings = new TestSettings()
    settings.setAll({ testOption: true })
    return settings.refresh()
      .then(
        t.fail,
        err => {
          t.equal(pushed, undefined)
          t.ok(err instanceof Settings.Missing)
        }
      )
  }
)

test(
  'refresh pushOnMissing works on Missing error',
  t => {
    let pushed
    mc.getAsync = () => P.resolve(pushed)
    mc.setAsync = (key, val) => {
      pushed = val
      return P.resolve(val)
    }
    const settings = new TestSettings()
    settings.setAll({ testOption: true })
    return settings.refresh({ pushOnMissing: true })
      .then(() => {
        t.deepEqual(pushed, { testOption: true })
      }, t.fail)
  }
)

test(
  'refresh pushOnMissing returns other Errors',
  t => {
    const mcError = new Error('memcached error')
    mc.getAsync = () => P.reject(mcError)
    mc.setAsync = (key, val) => {
      return P.reject(new Error('setAsync should not have been called'))
    }
    const settings = new TestSettings()
    settings.setAll({ testOption: true })
    return settings.refresh({ pushOnMissing: true })
      .then(
        t.fail,
        err => {
          t.equal(err, mcError)
        }
      )
  }
)
