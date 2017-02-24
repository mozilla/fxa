/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module exists because some files still use the old mailer config.
// Those files should import this module rather than its sibling index.js.
// If/when we eliminate the old mailer config and everything is importing
// index.js, we can merge this into there and get rid of the indirection.
// Be careful when doing that btw, they expect the log and config arguments
// in a different order.

var P = require('../promise')
var createMailer = require('./email')
var createSms = require('./sms')

module.exports = function (log, config, sender) {
  var Mailer = createMailer(log)
  return P.all(
    [
      require('./translator')(config.locales, config.defaultLanguage),
      require('./templates')()
    ]
  )
  .spread(
    function (translator, templates) {
      return {
        email: new Mailer(translator, templates, config.mail, sender),
        sms: createSms(log, translator, templates, config.sms)
      }
    }
  )
}
