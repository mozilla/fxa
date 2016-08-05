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

function camelize(str) {
  return str.replace(/_(.)/g,
    function(match, c) {
      return c.toUpperCase()
    }
  )
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
        name: camelize(name) + 'Email',
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
      'suspicious_location',
      'verification_reminder_first',
      'verification_reminder_second',
      'verify',
      'verify_login'
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
