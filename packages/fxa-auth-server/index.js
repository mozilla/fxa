/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('bluebird')
var createMailer = require('./mailer')

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
      return new Mailer(translator, templates, config.mail, sender)
    }
  )
}
