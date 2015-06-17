var path = require('path')
var P = require('bluebird')
var handlebars = require('handlebars')
var readFile = P.promisify(require("fs").readFile)

handlebars.registerHelper(
  't',
  function (string) {
    if (this.translator) {
      return this.translator.format(this.translator.gettext(string), this)
    }
    return string
  }
)

function loadTemplate(name) {
  return readFile(path.join(__dirname, name), { encoding: 'utf8' })
}

module.exports = function () {
  return P.all(
    [
      loadTemplate('verify.html'),
      loadTemplate('verify.txt'),
      loadTemplate('reset.html'),
      loadTemplate('reset.txt'),
      loadTemplate('unlock.html'),
      loadTemplate('unlock.txt'),
      loadTemplate('password_changed.html'),
      loadTemplate('password_changed.txt'),
      loadTemplate('password_reset.html'),
      loadTemplate('password_reset.txt'),
      loadTemplate('new_sync_device.html'),
      loadTemplate('new_sync_device.txt')
    ]
  )
  .spread(
    function (verifyHtml, verifyText, resetHtml, resetText, unlockHtml,
      unlockText, passwordChangedHtml, passwordChangedText, passwordResetHtml,
      passwordResetText, newSyncDeviceHtml, newSyncDeviceText) {
      var renderVerifyHtml = handlebars.compile(verifyHtml)
      var renderVerifyText = handlebars.compile(verifyText)
      var renderResetHtml = handlebars.compile(resetHtml)
      var renderResetText = handlebars.compile(resetText)
      var renderUnlockHtml = handlebars.compile(unlockHtml)
      var renderUnlockText = handlebars.compile(unlockText)
      var renderPasswordChangedHtml = handlebars.compile(passwordChangedHtml)
      var renderPasswordChangedText = handlebars.compile(passwordChangedText)
      var renderPasswordResetHtml = handlebars.compile(passwordResetHtml)
      var renderPasswordResetText = handlebars.compile(passwordResetText)
      var renderNewSyncDeviceHtml = handlebars.compile(newSyncDeviceHtml)
      var renderNewSyncDeviceText = handlebars.compile(newSyncDeviceText)

      return {
        verifyEmail: function (values) {
          return {
            html: renderVerifyHtml(values),
            text: renderVerifyText(values)
          }
        },
        recoveryEmail: function (values) {
          return {
            html: renderResetHtml(values),
            text: renderResetText(values)
          }
        },
        unlockEmail: function (values) {
          return {
            html: renderUnlockHtml(values),
            text: renderUnlockText(values)
          }
        },
        passwordChangedEmail: function (values) {
          return {
            html: renderPasswordChangedHtml(values),
            text: renderPasswordChangedText(values)
          }
        },
        passwordResetEmail: function (values) {
          return {
            html: renderPasswordResetHtml(values),
            text: renderPasswordResetText(values)
          }
        },
        newSyncDeviceEmail: function (values) {
          return {
            html: renderNewSyncDeviceHtml(values),
            text: renderNewSyncDeviceText(values)
          }
        }
      }
    }
  )
}
