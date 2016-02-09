/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var butil = require('./crypto/butil')
var log = require('../log')('db')
var P = require('./promise')
var Pool = require('./pool')

var bufferize = butil.bufferize

module.exports = function () {

  function DB(options) {
    this.pool = new Pool(options.url)
  }

  DB.connect = function (options) {
    var db = new DB(options)

    return db.pool.get('/')
      .then(
        function () {
          return db
        }
      )
  }

  DB.prototype.close = function () {
    return P.resolve(this.pool.close())
  }

  DB.prototype.ping = function () {
    return this.pool.get('/__heartbeat__')
  }

  DB.prototype.emailRecord = function (email) {
    return this.pool.get('/emailRecord/' + Buffer(email, 'utf8').toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
          data.emailVerified = !!data.emailVerified
          return data
        },
        function (err) {
          throw err
        }
      )
  }

  return DB
}
