var test = require('tap').test
var cp = require('child_process')
var path = require('path')
var P = require('p-promise')
var Client = require('../../client')
var config = require('../../config').root()

process.env.CONFIG_FILES = path.join(__dirname, '../config/verification.json')
process.env.NODE_ENV = 'local'

function main() {

  test(
    'create account',
    function (t) {
      var email = 'verification@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.fail('got keys before verifying email')
          },
          function (err) {
            t.equal(err.message, 'Unverified account', 'account is unverified')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, false)
          }
        )
        .then(waitForCode)
        .then(
          function (code) {
            return client.verifyEmail(code)
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, true)
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .done(
          function () {
            t.end()
          },
          function (err) {
            t.fail(err.message || err.error)
            t.end()
          }
        )
    }
  )

	test(
		'teardown',
		function (t) {
      mail.stop()
			server.kill('SIGINT')
			t.end()
		}
	)
}

///////////////////////////////////////////////////////////////////////////////

var Mail = require('lazysmtp').Mail
var mail = new Mail('127.0.0.1', true)

var codeMatch = /X-Verify-Code: (\w+)/
var verifyCode = null

mail.on(
  'mail',
  function (email) {
    var match = codeMatch.exec(email)
    if (match) {
      var code = match[1]
      verifyCode = code.toString().trim()
    }
    else {
      console.error('No verify code match')
      console.error(email)
    }
  }
)
mail.start(9999)

function waitForCode() {
  var d = P.defer()
  function loop() {
    if (verifyCode) {
      return d.resolve(verifyCode)
    }
    setTimeout(loop, 10)
  }
  loop()
  return d.promise
}

var server = cp.spawn(
  'node',
  ['../../bin/key_server.js'],
  {
    cwd: __dirname
  }
)

server.stdout.on('data', process.stdout.write.bind(process.stdout))
server.stderr.on('data', process.stderr.write.bind(process.stderr))


function waitLoop() {
  Client.Api.heartbeat(config.public_url)
    .done(
      main,
      function (err) {
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()
