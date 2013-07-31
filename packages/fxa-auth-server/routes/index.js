/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')

var P = require('p-promise')
var uuid = require('uuid')
var Hapi = require('hapi')
var error = require('../error')
var isA = Hapi.types

module.exports = function (
  log,
  serverPublicKey,
  signer,
  models
  ) {
  var srp = require('./srp')(models.SrpSession, models.AuthBundle)

  var defaults = require('./defaults')(P, models.dbs)
  var idp = require('./idp')(crypto, error, isA, serverPublicKey)
  var account = require('./account')(crypto, uuid, isA, error, models.Account, models.RecoveryMethod)
  var password = require('./password')(isA, error, srp, models.Account)
  var session = require('./session')(srp, isA, error, models.Account)
  var sign = require('./sign')(isA, error, signer, models.Account)

  var routes = defaults.concat(
    idp,
    account,
    password,
    session,
    sign
  )

  return routes
}
