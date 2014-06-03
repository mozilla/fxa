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
      loadTemplate('reset.txt')
    ]
  )
  .spread(
    function (verifyHtml, verifyText, resetHtml, resetText) {
      var renderVerifyHtml = handlebars.compile(verifyHtml)
      var renderVerifyText = handlebars.compile(verifyText)
      var renderResetHtml = handlebars.compile(resetHtml)
      var renderResetText = handlebars.compile(resetText)
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
        }
      }
    }
  )
}
