/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var P = require('bluebird')
var handlebars = require('handlebars')
var readFile = P.promisify(require('fs').readFile)

handlebars.registerHelper(
  't',
  function (string) {
    if (this.translator) {
      return this.translator.format(this.translator.gettext(string), this)
    }
    return string
  }
)

function generateTemplateName (str) {
  if (/^sms\.[A-Za-z]+/.test(str)) {
    return str
  }

  return str.replace(/_(.)/g,
    function(match, c) {
      return c.toUpperCase()
    }
  ) + 'Email'
}

function loadTemplates(name) {
  return P.all(
    [
      readFile(path.join(__dirname, name + '.txt'), { encoding: 'utf8' }),
      readFile(path.join(__dirname, name + '.html'), { encoding: 'utf8' })
    ]
  )
  .spread(
    function (text, html) {
      var renderText = handlebars.compile(text)
      var renderHtml = handlebars.compile(html)
      return {
        name: generateTemplateName(name),
        fn: function (values) {
          return {
            text: renderText(values),
            html: renderHtml(values)
          }
        }
      }
    }
  )
}

module.exports = function () {
  return P.all(
    [
      'new_device_login',
      'password_changed',
      'password_reset',
      'password_reset_required',
      'post_verify',
      'recovery',
      'sms.installFirefox',
      'unblock_code',
      'verification_reminder_first',
      'verification_reminder_second',
      'verify',
      'verify_login',
      'verify_sync'
    ].map(loadTemplates)
  )
  .then(
    function (templates) {
      // yields an object like:
      // {
      //   verifyEmail: function (values) {...} ,
      //   ...
      // }
      return templates.reduce(
        function (result, template) {
          result[template.name] = template.fn
          return result
        },
        {}
      )
    }
  )
}
