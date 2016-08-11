/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var config = require('../../config').getProperties()
var url = require('url')
var jwtool = require('fxa-jwtool')
var pubSigKey = jwtool.JWK.fromFile(config.publicKeyFile)
var duration = 1000 * 60 * 60 * 24 // 24 hours
var publicKey = {
  'algorithm': 'RS',
  'n': '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  'e': '65537'
}

process.env.SIGNIN_CONFIRMATION_ENABLED = true
process.env.SIGNIN_CONFIRMATION_RATE = 1.0

TestServer.start(config)
  .then(function main(server) {

    test(
      'account signin without keys does not set challenge',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
          .then(
            function (x) {
              client = x
              t.ok(client.authAt, 'authAt was set')
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
            }
          )
          .then(
            function () {
              return client.login({keys:false})
            }
          )
          .then(
            function (response) {
              t.notOk(response.verificationMethod, 'no challenge method set')
              t.notOk(response.verificationReason, 'no challenge reason set')
              t.equal(response.verified, true, 'verified set true')
            }
          )
      }
    )

    test(
      'account signin with keys does set challenge',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
          .then(
            function (x) {
              client = x
              t.ok(client.authAt, 'authAt was set')
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
            }
          )
          .then(
            function () {
              return client.login({keys:true})
            }
          )
          .then(
            function (response) {
              t.equal(response.verificationMethod, 'email', 'challenge method set')
              t.equal(response.verificationReason, 'login', 'challenge reason set')
              t.equal(response.verified, false, 'verified set to false')
            }
          )
      }
    )

    test(
      'account can verify new sign-in from email',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null
        var uid
        var code
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
          .then(
            function (x) {
              client = x
              t.ok(client.authAt, 'authAt was set')
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'new account is verified')
            }
          )
          .then(
            function () {
              return client.login({keys:true})
            }
          )
          .then(
            function (response) {
              t.equal(response.verificationMethod, 'email', 'challenge method set to email')
              t.equal(response.verificationReason, 'login', 'challenge reason set to signin')
              t.equal(response.verified, false, 'verified set to false')
            }
          )
          .then(
            function () {
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              uid = emailData.headers['x-uid']
              code = emailData.headers['x-verify-code']
              t.equal(emailData.subject, 'Confirm new sign-in to Firefox')
              t.ok(uid, 'sent uid')
              t.ok(code, 'sent verify code')
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, false, 'account is not verified, unverified sign-in')
            }
          )
          .then(
            function () {
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
              t.equal(status.verified, true, 'account is verified confirming email')
            }
          )
      }
    )

    test(
      'Account verification links still work after session verification',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null
        var emailCode, tokenCode, uid

        // Create unverified account
        return Client.create(config.publicUrl, email, password)
          .then(
            function (x) {
              client = x
            }
          )
          .then(
            function () {
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              // Ensure correct email sent
              t.equal(emailData.subject, 'Verify your Firefox Account')
              emailCode = emailData.headers['x-verify-code']
              t.ok(emailCode, 'sent verify code')
              return client.verifyEmail(emailCode)
            }
          )
          .then(
            function () {
              // Trigger sign-in confirm email
              return client.login({keys:true})
            }
          )
          .then(
            function () {
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              // Verify sign-confirm email
              uid = emailData.headers['x-uid']
              tokenCode = emailData.headers['x-verify-code']
              t.equal(emailData.subject, 'Confirm new sign-in to Firefox')
              t.ok(uid, 'sent uid')
              t.ok(tokenCode, 'sent verify code')
              t.notEqual(tokenCode, emailCode, 'email and token codes are different')

              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              // Verify account is unverified because of sign-in attempt
              t.equal(status.verified, false, 'account is not verified,')
              t.equal(status.sessionVerified, false, 'account is not verified, unverified sign-in session')

              // Attempt to verify account reusing original email code
              return client.verifyEmail(emailCode)
            }
          )
          .then(
            function () {
              t.pass('The code from the account verification email worked again')
            }
          )
      }
    )

    test(
      'sign-in verification email link',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'something'
        var client = null
        var options = {
          redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
          service: 'sync',
          resume: 'resumeToken',
          keys: true
        }
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, options)
          .then(
            function (c) {
              client = c
            }
          )
          .then(
            function () {
              return client.login(options)
            }
          )
          .then(
            function () {
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              var link = emailData.headers['x-link']
              var query = url.parse(link, true).query
              t.ok(query.uid, 'uid is in link')
              t.ok(query.code, 'code is in link')
              t.equal(query.service, options.service, 'service is in link')
              t.equal(query.resume, options.resume, 'resume is in link')
              t.equal(emailData.subject, 'Confirm new sign-in to Firefox')
            }
          )
      }
    )

    test(
      'sign-in verification from different client',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'something'
        var client = null
        var client2 = null
        var options = {
          redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
          service: 'sync',
          resume: 'resumeToken',
          keys: true
        }
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, options)
          .then(
            function (c) {
              client = c
            }
          )
          .then(
            function () {
              return client.login(options)
            }
          )
          .then(
            function () {
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              var link = emailData.headers['x-link']
              var query = url.parse(link, true).query
              t.ok(query.uid, 'uid is in link')
              t.ok(query.code, 'code is in link')
              t.equal(query.service, options.service, 'service is in link')
              t.equal(query.resume, options.resume, 'resume is in link')
              t.equal(emailData.subject, 'Confirm new sign-in to Firefox', 'email subject is correct')
            }
          )
          .then(
            function () {
              // Attempt to login from new location
              return Client.login(config.publicUrl, email, password, server.mailbox, options)
            }
          )
          .then(
            function (c) {
              client2 = c
            }
          )
          .then(
            function () {
              return client2.login(options)
            }
          )
          .then(
            function () {
              return server.mailbox.waitForCode(email)
            }
          )
          .then(
            function (code) {
              // Verify account from client2
              return client2.verifyEmail(code, options)
            }
          )
          .then(
            function () {
              return client2.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, true, 'account session is  verified')
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, false, 'account is not verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, false, 'account session is not verified')
            }
          )
      }
    )

    test(
      'certificate sign with unverified session',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null

        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
          .then(
            function (c) {
              client = c
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, true, 'account session is  verified')
            }
          )
          .then(
            function () {
              // Attempt to login from new location
              return client.login({keys:true})
            }
          )
          .then(
            function (c) {
              client = c
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              // Ensure unverified session
              t.equal(status.verified, false, 'account is not verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, false, 'account session is not verified')
            }
          )
          .then(
            function () {
              // Attempt to get signed cert
              return client.sign(publicKey, duration)
            }
          )
          .then(
            function (cert) {
              t.equal(typeof(cert), 'string', 'cert exists')
              var payload = jwtool.verify(cert, pubSigKey.pem)
              t.equal(payload.iss, config.domain, 'issuer is correct')
              t.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
              t.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number')
              t.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible')
              t.equal(payload['fxa-verifiedEmail'], email, 'verifiedEmail is correct')
              t.equal(payload['fxa-tokenVerified'], false, 'tokenVerified is not verified')
            }
          )
      }
    )

    test(
      'certificate sign with keys=false session',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null

        // Initial account creation uses keys=true
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
          .then(
            function (c) {
              client = c
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, true, 'account session is  verified')
            }
          )
          .then(
            function () {
              // Attempt a second login, but don't request keys
              return client.login({keys:false})
            }
          )
          .then(
            function (c) {
              client = c
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              // Ensure unverified session
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, false, 'account session is not verified')
            }
          )
          .then(
            function () {
              // Attempt to get signed cert
              return client.sign(publicKey, duration)
            }
          )
          .then(
            function (cert) {
              t.equal(typeof(cert), 'string', 'cert exists')
              var payload = jwtool.verify(cert, pubSigKey.pem)
              t.equal(payload.iss, config.domain, 'issuer is correct')
              t.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
              t.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number')
              t.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible')
              t.equal(payload['fxa-verifiedEmail'], email, 'verifiedEmail is correct')
              t.equal(payload['fxa-tokenVerified'], false, 'tokenVerified is not verified')
            }
          )
      }
    )

    test(
      'certificate sign with verified session',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null

        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
          .then(
            function (c) {
              client = c
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, true, 'account session is  verified')
            }
          )
          .then(
            function () {
              // Attempt to get signed cert
              return client.sign(publicKey, duration)
            }
          )
          .then(
            function (cert) {
              t.equal(typeof(cert), 'string', 'cert exists')
              var payload = jwtool.verify(cert, pubSigKey.pem)
              t.equal(payload.iss, config.domain, 'issuer is correct')
              t.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
              t.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number')
              t.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible')
              t.equal(payload['fxa-verifiedEmail'], email, 'verifiedEmail is correct')
              t.equal(payload['fxa-tokenVerified'], true, 'tokenVerified is verified')
            }
          )
      }
    )

    test(
      'account keys, return keys on verified account',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null
        var tokenCode

        return Client.create(config.publicUrl, email, password, {keys:true})
          .then(
            function (c) {
              client = c
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, false, 'account is not verified')
              t.equal(status.emailVerified, false, 'account email is not verified')
              t.equal(status.sessionVerified, false, 'account session is not verified')
            }
          )
          .then(
            function () {
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              t.equal(emailData.subject, 'Verify your Firefox Account')
              tokenCode = emailData.headers['x-verify-code']
              t.ok(tokenCode, 'sent verify code')
            }
          )
          .then(
            function () {
              // Unverified accounts can not retrieve keys
              return client.keys()
            }
          )
          .catch(function(err){
            t.equal(err.errno, 104, 'Correct error number')
            t.equal(err.code, 400, 'Correct error code')
            t.equal(err.message, 'Unverified account', 'Correct error message')
          })

          .then(
            function () {
              // Verify the account will set emails and tokens verified, which
              // will user to retrieve keys.
              return client.verifyEmail(tokenCode)
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, true, 'account session is  verified')
            }
          )
          .then(
            function () {
              // Once verified, keys can be returned
              return client.keys()
            }
          )
          .then(
            function (keys) {
              t.ok(keys.kA, 'has kA keys')
              t.ok(keys.kB, 'has kB keys')
              t.ok(keys.wrapKb, 'has wrapKb keys')
            }
          )
      }
    )

    test(
      'account keys, return keys on verified login',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var client = null
        var tokenCode

        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
          .then(
            function (c) {
              // Trigger confirm sign-in
              client = c
              return client.login({keys: true})
            }
          )
          .then(
            function (c) {
              client = c
              return server.mailbox.waitForEmail(email)
            }
          )
          .then(
            function (emailData) {
              t.equal(emailData.subject, 'Confirm new sign-in to Firefox')
              tokenCode = emailData.headers['x-verify-code']
              t.ok(tokenCode, 'sent verify code')
            }
          )
          .then(
            function () {
              return client.keys()
            }
          )
          .catch(function(err){
            // Because of unverified sign-in, requests for keys will fail
            t.equal(err.errno, 104, 'Correct error number')
            t.equal(err.code, 400, 'Correct error code')
            t.equal(err.message, 'Unverified account', 'Correct error message')
          })
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              // Verify status of account, only email should be verified
              t.equal(status.verified, false, 'account is not verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, false, 'account session is not verified')
            }
          )
          .then(
            function () {
              // Verify the account will set tokens verified.
              return client.verifyEmail(tokenCode)
            }
          )
          .then(
            function () {
              return client.emailStatus()
            }
          )
          .then(
            function (status) {
              t.equal(status.verified, true, 'account is verified')
              t.equal(status.emailVerified, true, 'account email is verified')
              t.equal(status.sessionVerified, true, 'account session is  verified')
            }
          )
          .then(
            function () {
              // Can retrieve keys now that account tokens verified
              return client.keys()
            }
          )
          .then(
            function (keys) {
              t.ok(keys.kA, 'has kA keys')
              t.ok(keys.kB, 'has kB keys')
              t.ok(keys.wrapKb, 'has wrapKb keys')
            }
          )
      }
    )

    test(
      'teardown',
      function (t) {
        server.stop()
        t.end()
      }
    )
  })
