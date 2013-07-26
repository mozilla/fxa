/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Client = require('./')
var client = new Client('http://localhost:9000')

var email = 'me@example.com';
var password = 'verySecurePassword';
var publicKey = {
  "algorithm":"RS",
  "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
  "e":"65537"
};
var duration = 1000 * 60 * 60 * 24;

client
  .create(email, password)
  .then(client.startLogin.bind(client, email))
  .then(client.finishLogin.bind(client, email, password))
  .done(
    function (tokens) {
      console.log(tokens)
    },
    function (err) {
      console.error(err)
    }
  )
