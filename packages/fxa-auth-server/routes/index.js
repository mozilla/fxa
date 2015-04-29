/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')

var P = require('../promise')
var uuid = require('uuid')
var isA = require('joi')
var url = require('url')

module.exports = function (
  log,
  error,
  serverPublicKey,
  signer,
  db,
  mailer,
  Password,
  config,
  customs
  ) {
  var isProduction = config.env === 'prod'
  var isPreVerified = require('../preverifier')(error, config)
  var defaults = require('./defaults')(log, P, db, error)
  var idp = require('./idp')(log, serverPublicKey)
  var checkPassword = require('./utils/password_check')(log, config, Password, customs, db)
  var account = require('./account')(
    log,
    crypto,
    P,
    uuid,
    isA,
    error,
    db,
    mailer,
    Password,
    config.smtp.redirectDomain,
    config.verifierVersion,
    isProduction,
    config.domain,
    config.smtp.resendBlackoutPeriod,
    customs,
    isPreVerified,
    checkPassword
  )
  var password = require('./password')(
    log,
    isA,
    error,
    db,
    Password,
    config.smtp.redirectDomain,
    mailer,
    config.verifierVersion,
    customs,
    checkPassword
  )
  var session = require('./session')(log, isA, error, db)
  var sign = require('./sign')(log, isA, error, signer, db, config.domain)
  var util = require('./util')(
    log,
    crypto,
    isA,
    config,
    config.smtp.redirectDomain
  )

  var basePath = url.parse(config.publicUrl).path
  if (basePath === '/') { basePath = '' }

  var v1Routes = [].concat(
    account,
    password,
    session,
    sign,
    util
  )
  v1Routes.forEach(function(r) { r.path = basePath + "/v1" + r.path })
  defaults.forEach(function(r) { r.path = basePath + r.path })
  var allRoutes = defaults.concat(idp, v1Routes)

  return allRoutes
}
