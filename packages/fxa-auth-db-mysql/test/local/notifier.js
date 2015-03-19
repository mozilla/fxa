/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var fs = require('fs')
var path = require('path')
var url = require('url')
var test = require('../ptaptest')
var nock = require('nock')
var JWK = require('fxa-jwtool').JWK

var NOTIFICATION_SERVER = 'http://notify.me'

var log = { records: [] }
log.debug = log.error = function(msg) {
  log.records.push(msg)
}

var config = require('../../config')
config.notifications.publishUrl = NOTIFICATION_SERVER + '/v0/publish'
config.notifications.jwt.iss = 'test.com'
config.notifications.jwt.jku = 'http://test.com/.well-known/keys'
config.notifications.jwt.kid = 'test-key'
config.notifications.jwt.secretKeyFile = './test/local/test-secret.pem'

var publicKey = JWK.fromPEM(fs.readFileSync(
  path.resolve(__dirname, 'test-public.pem'),
  'utf8'
))

var notifier = require('../../notifier')(log, config)

var events = [
  { uid: 'ABCDEF', typ: 'create', iat: 123456 },
  { uid: 'ABCDEF', typ: 'verify', iat: 234567 }
]

test(
  'notifier should publish events as signed jwts',
  function (t) {
    t.plan(17)
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
        t.equal(log.records[0].op, 'Notifier.publish')
        mock.done()
        t.equal(jwts.length, 2)
        var evt1 = publicKey.verifySync(jwts[0])
        // XXX TODO: seems unnecessary...
        evt1.payload = JSON.parse(evt1.payload)
        t.equal(evt1.header.jku, config.notifications.jwt.jku)
        t.equal(evt1.header.kid, config.notifications.jwt.kid)
        t.equal(evt1.payload.iss, config.notifications.jwt.iss)
        t.equal(evt1.payload.aud, url.parse(NOTIFICATION_SERVER).host)
        t.equal(evt1.payload.uid, 'ABCDEF')
        t.equal(evt1.payload.typ, 'create')
        t.equal(evt1.payload.iat, 123456)
        var evt2 = publicKey.verifySync(jwts[1])
        evt2.payload = JSON.parse(evt2.payload)
        t.equal(evt2.header.jku, config.notifications.jwt.jku)
        t.equal(evt2.header.kid, config.notifications.jwt.kid)
        t.equal(evt2.payload.iss, config.notifications.jwt.iss)
        t.equal(evt2.payload.aud, url.parse(NOTIFICATION_SERVER).host)
        t.equal(evt2.payload.uid, 'ABCDEF')
        t.equal(evt2.payload.typ, 'verify')
        t.equal(evt2.payload.iat, 234567)
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
