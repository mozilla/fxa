var test = require('tap').test
var cp = require('child_process')
var Client = require('../client')
var config = require('../config').root()

var email = 'test@example.com'
var password = 'allyourbasearebelongtous'
var publicKey = {
  "algorithm":"RS",
  "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
  "e":"65537"
};
var duration = 1000 * 60 * 60 * 24;

process.env.DEV_VERIFIED = 'true'

var server = cp.spawn(
  'node',
  ['../bin/key_server.js'],
  {
    cwd: __dirname
  }
)

function main() {
  test(
    'Create account flow',
    function (t) {
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
            t.equal(typeof(keys.kA), 'string')
            t.equal(typeof(keys.wrapKb), 'string')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            t.equal(typeof(cert), 'string')
          }
        )
        .done(
          function () {
            server.kill('SIGINT')
            t.end()
          },
          function (err) {
            server.kill('SIGINT')
            t.fail(err.message)
            t.end()
          }
        )
    }
  )

  test(
    'Change password flow',
    function (t) {
      //TODO
      t.end()
    }
  )
}

function waitLoop() {
  Client.Api.heartbeat(config.public_url)
    .done(
      main,
      function (err) {
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()
