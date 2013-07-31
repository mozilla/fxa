/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Client = require('./')
var email = 'me@example.com';
var password = 'verySecurePassword';
var publicKey = {
  "algorithm":"RS",
  "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
  "e":"65537"
};
var duration = 1000 * 60 * 60 * 24;


var client = null

Client.create('http://localhost:9000', email, password)
  .then(
    function (x) {
      client = x
      return client.keys()
    }
  )
  .then(
    function (keys) {
      console.log('my keys:', keys)
    }
  )
  .then(
    function () {
      return client.sign(publicKey, duration)
    }
  )
  .then(
    function (cert) {
      console.log('my cert:', cert)
      return 'done'
    }
  )
  .done(console.log, console.error)

