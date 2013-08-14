var test = require('tap').test
var cp = require('child_process')
var Client = require('../../client')
var config = require('../../config').root()

process.env.DEV_VERIFIED = 'true'

var server = null

function main() {
  test(
    'Create account flow',
    function (t) {
      var email = 'test@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      var publicKey = {
        "algorithm":"RS",
        "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
        "e":"65537"
      };
      var duration = 1000 * 60 * 60 * 24
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.equal(typeof(keys.kA), 'string', 'kA exists')
            t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            t.equal(typeof(cert), 'string', 'cert exists')
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
    'Change password flow',
    function (t) {
      var email = 'test2@example.com'
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var wrapKb = null
      var client = null
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            wrapKb = keys.wrapKb
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword)
          }
        )
        .then(
          function () {
            t.equal(client.password, newPassword, 'password has changed')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.equal(keys.wrapKb, wrapKb, 'wrapKb is preserved')
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
    'Login flow',
    function (t) {
      var email = 'test2@example.com'
      var password = 'foobar'
      var wrapKb = null
      var client = null
      var publicKey = {
        "algorithm":"RS",
        "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
        "e":"65537"
      };
      var duration = 1000 * 60 * 60 * 24
      Client.login(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.equal(typeof(keys.kA), 'string', 'kA exists')
            t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            t.equal(typeof(cert), 'string', 'cert exists')
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
    'account destroy',
    function (t) {
      var email = 'test3@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.devices()
          }
        )
        .then(
          function (devices) {
            t.equal(devices.length, 1, 'we have an account')
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .done(
          function (keys) {
            t.fail('account not destroyed')
            t.end()
          },
          function (err) {
            t.equal(err.message, 'Unknown account', 'account destroyed')
            t.end()
          }
        )
    }
  )

  test(
    'teardown',
    function (t) {
      if (server) server.kill('SIGINT')
      t.end()
    }
  )
}

function startServer() {
  var server = cp.spawn(
    'node',
    ['../../bin/key_server.js'],
    {
      cwd: __dirname
    }
  )

  server.stdout.on('data', process.stdout.write.bind(process.stdout))
  server.stderr.on('data', process.stderr.write.bind(process.stderr))
  return server
}

function waitLoop() {
  Client.Api.heartbeat(config.public_url)
    .done(
      main,
      function (err) {
        if (!server) {
          server = startServer()
        }
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()
