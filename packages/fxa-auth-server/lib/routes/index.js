/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const url = require('url')

module.exports = function (
  log,
  serverPublicKeys,
  signer,
  db,
  mailer,
  smsImpl,
  Password,
  config,
  customs
  ) {
  const defaults = require('./defaults')(log, db)
  const idp = require('./idp')(log, serverPublicKeys)
  const signinUtils = require('./utils/signin')(log, config, customs, db, mailer)
  const push = require('../push')(log, db, config)
  const account = require('./account')(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    signinUtils,
    push
  )
  const pushbox = require('../pushbox')(log, config)
  const devicesImpl = require('../devices')(log, db, push)
  const devicesSessions = require('./devices-and-sessions')(log, db, config, customs, push, pushbox, devicesImpl)
  const emails = require('./emails')(log, db, mailer, config, customs, push)
  const password = require('./password')(
    log,
    db,
    Password,
    config.smtp.redirectDomain,
    mailer,
    config.verifierVersion,
    customs,
    signinUtils,
    push,
    config
  )
  const tokenCodes = require('./token-codes')(log, db, config, customs)
  const session = require('./session')(log, db, Password, config, signinUtils)
  const sign = require('./sign')(log, signer, db, config.domain, devicesImpl)
  const signinCodes = require('./signin-codes')(log, db, customs)
  const smsRoute = require('./sms')(log, db, config, customs, smsImpl)
  const unblockCodes = require('./unblock-codes')(log, db, mailer, config.signinUnblock, customs)
  const totp = require('./totp')(log, db, mailer, customs, config.totp)
  const recoveryCodes = require('./recovery-codes')(log, db, config.totp, customs, mailer)
  const recoveryKeys = require('./recovery-keys')(log, db, Password, config.verifierVersion, customs)
  const util = require('./util')(
    log,
    config,
    config.smtp.redirectDomain
  )

  let basePath = url.parse(config.publicUrl).path
  if (basePath === '/') { basePath = '' }

  const v1Routes = [].concat(
    account,
    devicesSessions,
    emails,
    password,
    recoveryCodes,
    session,
    signinCodes,
    sign,
    smsRoute,
    tokenCodes,
    totp,
    unblockCodes,
    util,
    recoveryKeys
  )
  v1Routes.forEach(r => { r.path = basePath + '/v1' + r.path })
  defaults.forEach(r => { r.path = basePath + r.path })
  const allRoutes = defaults.concat(idp, v1Routes)

  allRoutes.forEach(r => {
    // Default auth.payload to 'optional' for all authenticated routes.
    // We'll validate the payload hash if the client provides it,
    // but allow them to skip it if they can't or don't want to.
    const auth = r.options && r.options.auth
    if (auth && ! auth.hasOwnProperty('payload')) {
      auth.payload = 'optional'
    }

    // Remove custom `apidoc` key which we use for generating docs,
    // but which Hapi doesn't like if it's there at runtime.
    delete r.apidoc
  })

  return allRoutes
}
