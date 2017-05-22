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
  bounces,
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
  const devices = require('../devices')(log, db, push)
  const account = require('./account')(
    log,
    db,
    bounces,
    mailer,
    Password,
    config,
    customs,
    checkPassword,
    push,
    devices
  )
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
  const session = require('./session')(log, db)
  const sign = require('./sign')(log, signer, db, config.domain, devices)
  const smsRoute = require('./sms')(log, db, config, customs, smsImpl)
  const util = require('./util')(
    log,
    config,
    config.smtp.redirectDomain
  )

  let basePath = url.parse(config.publicUrl).path
  if (basePath === '/') { basePath = '' }

  const v1Routes = [].concat(
    account,
    password,
    session,
    sign,
    smsRoute,
    util
  )
  v1Routes.forEach(r => { r.path = basePath + '/v1' + r.path })
  defaults.forEach(r => { r.path = basePath + r.path })
  const allRoutes = defaults.concat(idp, v1Routes)

  return allRoutes
}
