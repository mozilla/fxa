/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var fs = require('fs')
var path = require('path')
var url = require('url')
var test = require('tap').test
var nock = require('nock')
var JWK = require('fxa-jwtool').JWK

var NOTIFICATION_SERVER = 'http://notify.me'

var log = { records: [] }
log.debug = log.error = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0)
  log.records.push(args)
}

var config = require('../../config')
config.notifications.publishUrl = NOTIFICATION_SERVER + '/v0/publish'
config.notifications.jwt.iss = 'test.com'
config.notifications.jwt.jku = 'http://test.com/.well-known/keys'
config.notifications.jwt.kid = 'test-key'
config.notifications.jwt.secretKeyFile = path.resolve(__dirname, 'test-secret.pem')

var publicKey = JWK.fromPEM(fs.readFileSync(
  path.resolve(__dirname, 'test-public.pem'),
  'utf8'
))

var notifier = require('../../lib/notifier')(log, config)

var events = [
  { uid: 'ABCDEF', typ: 'create', iat: 123456 },
  { uid: 'ABCDEF', typ: 'verify', iat: 234567 }
]

test(
  'notifier should publish events as signed jwts',
  function (t) {
    t.plan(13)
    var jwts
    var mock = nock(NOTIFICATION_SERVER)
      .post('/v0/publish', function(body) {
        jwts = body.events
        return true
      })
      .reply(200)
    return notifier.publish(events)
      .then(function (numPublished) {
        t.equal(numPublished, 2)
        t.equal(log.records[0][0], 'Notifier.publish')
        mock.done()
        t.equal(jwts.length, 2)
        var evt1 = publicKey.verifySync(jwts[0])
        t.equal(evt1.iss, config.notifications.jwt.iss)
        t.equal(evt1.aud, url.parse(NOTIFICATION_SERVER).host)
        t.equal(evt1.uid, 'ABCDEF')
        t.equal(evt1.typ, 'create')
        t.equal(evt1.iat, 123456)
        var evt2 = publicKey.verifySync(jwts[1])
        t.equal(evt2.iss, config.notifications.jwt.iss)
        t.equal(evt2.aud, url.parse(NOTIFICATION_SERVER).host)
        t.equal(evt2.uid, 'ABCDEF')
        t.equal(evt2.typ, 'verify')
        t.equal(evt2.iat, 234567)
      })
  }
)

test(
  'notifier should handle error responses from the notification server',
  function (t) {
    t.plan(1)
    var mock = nock(NOTIFICATION_SERVER)
      .post('/v0/publish')
      .reply(503, 'service unavailable')
    return notifier.publish(events)
      .then(function () {
        t.fail('notifier.publish should have thrown an error')
      }, function (err) {
        t.ok('whelp, here we are')
        mock.done()
      })
  }
)
