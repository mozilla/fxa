/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var butil = require('../crypto/butil')
var log = require('./log')('db')
var P = require('../promise')
var Pool = require('./pool')
var qs = require('querystring')

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
          data.emailVerified = !! data.emailVerified
          return data
        },
        function (err) {
          throw err
        }
      )
  }

  DB.prototype.account = function (uid) {
    log.trace({ op: 'DB.account', uid: uid })
    return this.pool.get('/account/' + uid.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
          data.emailVerified = !! data.emailVerified
          return data
        },
        function (err) {
          throw err
        }
      )
  }

  /**
   * Create a new reminder
   * @param reminderData
   * @param {string} reminderData.uid - The uid to remind.
   * @param {string} reminderData.type - The type of a reminder.
   */
  DB.prototype.createVerificationReminder = function (reminderData) {
    log.debug('createVerificationReminder', reminderData)

    return this.pool.post('/verificationReminders', reminderData)
  }

  /**
   * Fetch reminders given reminder age
   *
   * @param options
   * @param {string} options.type - Type of reminder. Can be 'first' or 'second'.
   * @param {string} options.reminderTime - Reminder age in MS.
   * @param {string} options.reminderTimeOutdated - Reminder outdated age in MS.
   * @param {string} options.limit - Number of records to fetch.
   */
  DB.prototype.fetchReminders = function (options) {
    log.debug('fetchReminders', options)

    var query = '?' + qs.stringify(options)
    return this.pool.get('/verificationReminders' + query, options)
  }

  return DB
}
