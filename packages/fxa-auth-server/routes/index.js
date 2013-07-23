/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')

var P = require('p-promise')
var uuid = require('uuid')
var Hapi = require('hapi')
var error = Hapi.error
var isA = Hapi.types

module.exports = function (
  log,
  dbs,
  serverPublicKey,
  signer,
  Account,
  AuthBundle,
  RecoveryMethod,
  SrpSession) {
  var srp = require('./srp')(SrpSession, AuthBundle)

  var defaults = require('./defaults')(P, dbs)
  var idp = require('./idp')(crypto, error, isA, serverPublicKey)
  var account = require('./account')(uuid, isA, error, Account, RecoveryMethod)
  var password = require('./password')(isA, error, srp, Account)
  var session = require('./session')(srp, isA, error, Account)
  var sign = require('./sign')(isA, error, signer, Account)

  var routes = defaults.concat(
    idp,
    account,
    password,
    session,
    sign
  )

  return routes
}
