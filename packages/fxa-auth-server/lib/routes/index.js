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
  const checkPassword = require('./utils/password_check')(log, config, Password, customs, db)
  const push = require('../push')(log, db, config)
  const account = require('./account')(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    checkPassword,
    push
  )
  const devicesImpl = require('../devices')(log, db, push)
  const devicesSessions = require('./devices-and-sessions')(log, db, config, customs, push, devicesImpl)
  const emails = require('./emails')(log, db, mailer, config, customs, push)
  const password = require('./password')(
    log,
    db,
    Password,
    config.smtp.redirectDomain,
    mailer,
    config.verifierVersion,
    customs,
    checkPassword,
    push,
    config
  )
  const tokenCodes = require('./token-codes')(log, db, customs)
  const session = require('./session')(log, db)
  const sign = require('./sign')(log, signer, db, config.domain, devicesImpl)
  const signinCodes = require('./signin-codes')(log, db, customs)
  const smsRoute = require('./sms')(log, db, config, customs, smsImpl)
  const unblockCodes = require('./unblock-codes')(log, db, mailer, config.signinUnblock, customs)
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
    tokenCodes,
    session,
    signinCodes,
    sign,
    smsRoute,
    unblockCodes,
    util
  )
  v1Routes.forEach(r => { r.path = basePath + '/v1' + r.path })
  defaults.forEach(r => { r.path = basePath + r.path })
  const allRoutes = defaults.concat(idp, v1Routes)

  return allRoutes
}
