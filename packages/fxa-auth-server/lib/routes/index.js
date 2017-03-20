/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const P = require('../promise')
const uuid = require('uuid')
const isA = require('joi')
const url = require('url')
const random = require('../crypto/random')

module.exports = function (
  log,
  error,
  serverPublicKeys,
  signer,
  db,
  mailer,
  smsImpl,
  Password,
  config,
  customs
  ) {
  const defaults = require('./defaults')(log, P, db, error)
  const idp = require('./idp')(log, serverPublicKeys)
  const checkPassword = require('./utils/password_check')(log, config, Password, customs, db)
  const push = require('../push')(log, db, config)
  const devices = require('../devices')(log, db, push)
  const account = require('./account')(
    log,
    random,
    P,
    uuid,
    isA,
    error,
    db,
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
    isA,
    error,
    db,
    Password,
    config.smtp.redirectDomain,
    mailer,
    config.verifierVersion,
    customs,
    checkPassword,
    push
  )
  const session = require('./session')(log, isA, error, db)
  const sign = require('./sign')(log, P, isA, error, signer, db, config.domain, devices)
  const smsRoute = require('./sms')(log, isA, error, config, customs, smsImpl)
  const util = require('./util')(
    log,
    random,
    isA,
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
