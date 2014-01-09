/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')

var P = require('../promise')
var uuid = require('uuid')
var Hapi = require('hapi')
var isA = Hapi.types

module.exports = function (
  log,
  error,
  serverPublicKey,
  signer,
  db,
  mailer,
  config
  ) {
  var isProduction = config.env === 'prod'
  var defaults = require('./defaults')(log, P, db, error)
  var idp = require('./idp')(log, serverPublicKey)
  var account = require('./account')(log, crypto, P, uuid, isA, error, db, mailer, isProduction)
  var password = require('./password')(log, isA, error, db, mailer)
  var session = require('./session')(log, isA, error, db)
  var sign = require('./sign')(log, isA, error, signer, config.domain)
  var util = require('./util')(log, crypto, isA, config)

  var v1Routes = [].concat(
    account,
    password,
    session,
    sign,
    util
  )
  v1Routes.forEach(function(route) {
    route.path = "/v1" + route.path
  })

  var routes = defaults.concat(idp, v1Routes)

  return routes
}
