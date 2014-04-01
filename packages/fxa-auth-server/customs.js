/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 var P = require('./promise')

 module.exports = function (log, error) {

  var MAX_RECORDS = 10000
  var RECORD_LIFETIME = 1000 * 60 * 15
  var CLEANUP_INTERVAL = 1000 * 60
  var RETRY_AFTER = RECORD_LIFETIME / 1000
  var MAX_FAILED_LOGINS = 5
  var MAX_EMAILS = 3

  function Record() {
    this.date = null
    this.counts = counts()
    this.flags = 0
  }

  function counts() {
    return {
      accountCreate: 0,
      accountLogin: 0,
      recoveryEmailResendCode: 0,
      passwordForgotSendCode: 0,
      passwordForgotResendCode: 0
    }
  }

  Record.prototype.emailSent = function () {
    return this.counts.accountCreate +
      this.counts.recoveryEmailResendCode +
      this.counts.passwordForgotSendCode +
      this.counts.passwordForgotResendCode
  }

  Record.prototype.accountCreate = function () {
    if (this.emailSent() > MAX_EMAILS) {
      return P.reject(error.tooManyRequests(RETRY_AFTER))
    }
    return P()
  }

  Record.prototype.accountLogin = function () {
    if (this.flags > MAX_FAILED_LOGINS) {
      return P.reject(error.tooManyRequests(RETRY_AFTER))
    }
    return P()
  }

  Record.prototype.recoveryEmailResendCode = function () {
    if (this.emailSent() > MAX_EMAILS) {
      return P.reject(error.tooManyRequests(RETRY_AFTER))
    }
    return P()
  }

  Record.prototype.passwordForgotSendCode = function () {
    if (this.emailSent() > MAX_EMAILS) {
      return P.reject(error.tooManyRequests(RETRY_AFTER))
    }
    return P()
  }

  Record.prototype.passwordForgotResendCode = function () {
    if (this.emailSent() > MAX_EMAILS) {
      return P.reject(error.tooManyRequests(RETRY_AFTER))
    }
    return P()
  }

  function Customs() {
    this.records = {}
    this.count = 0
    this.reaper = setInterval(reap.bind(this), CLEANUP_INTERVAL)
    this.reaper.unref()
  }

  function reap() {
    var now = Date.now()
    var emails = Object.keys(this.records)
    var expired = 0
    var stats = {
      stat: 'customs',
      records: 0,
      spam: 0,
      flagged: 0,
      expired: 0
    }
    for (var i = 0; i < emails.length; i++) {
      var email = emails[i]
      var record = this.records[email]
      if (record.emailSent() > MAX_EMAILS) { stats.spam++ }
      if (record.flags > MAX_FAILED_LOGINS) { stats.flagged++ }
      if (now - record.date > RECORD_LIFETIME) {
        delete this.records[email]
        this.count--
        expired++
      }
    }
    var remaining = emails.length - expired
    stats.records = remaining
    stats.expired = expired
    stats.runtime = Date.now() - now
    log.stat(stats)
  }

  Customs.prototype.getOrCreate = function (email) {
    var record = this.records[email]
    if (!record) {
      this.count++
      record = new Record()
    }
    return record
  }

  Customs.prototype.check = function (email, action) {
    log.trace({ op: 'customs.check', email: email, action: action })
    if (this.count >= MAX_RECORDS * 2) {
      var emails = Object.keys(this.records)
      for (var i = 0; i < MAX_RECORDS; i++) {
        delete this.records[emails[i]]
        this.count--
      }
    }
    var record = this.getOrCreate(email)
    record.date = Date.now()
    record.counts[action] = record.counts[action] + 1 || 1
    this.records[email] = record
    return record[action]()
  }

  Customs.prototype.flag = function (email) {
    log.trace({ op: 'customs.flag', email: email })
    var record = this.getOrCreate(email)
    record.flags++
    return P()
  }

  return new Customs()
}
