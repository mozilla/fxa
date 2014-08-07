/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (intern, registerSuite, assert, config, request) {
  'use strict';

  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var emailTemplates = {
    '/en-US/reset': {
      subject: /Reset your password/,
      text: /Reset password/,
      html: /Reset password/
    },
    '/it-CH/reset': {
      subject: /pɹoʍssad ɹnoʎ ʇǝsǝᴚ/,
      text: /pɹoʍssad ʇǝsǝᴚ/,
      html: /pɹoʍssad ʇǝsǝᴚ/
    },
    '/en-US/verify': {
      subject: /Verify/,
      text: /Verify/,
      html: /Verify/
    },
    '/it-CH/verify': {
      subject: /ʇunoɔɔa ɹnoʎ ʎɟıɹǝɅ/,
      text: /ʎɟıɹǝɅ/,
      html: /ʎɟıɹǝɅ/
    }
  };

  var suite = {
    name: 'email templates'
  };

  if (intern.config.fxaProduction) {
    // skip tests for obsolete email templates in production
    registerSuite(suite);
    return;
  }

  function emailTemplateTest(name, matches) {
    suite['#get email template for ' + name] = function() {
      var dfd = this.async(1000);

      request(serverUrl + '/template' + name, dfd.callback(function(err, res, body) {
          var json = JSON.parse(body);

          assert.match(json.subject, matches.subject);
          assert.match(json.text, matches.text);
          assert.match(json.html, matches.html);

          // make sure these variables are present and use {{
          assert.match(json.text, /{{{link}}}/);
          assert.match(json.html, /[^{]{{link}}/);
          assert.match(json.text, /{{{email}}}/);
          assert.match(json.html, /[^{]{{email}}/);

        }, dfd.reject.bind(dfd)));
    };
  }

  Object.keys(emailTemplates).forEach(function(key) {
    emailTemplateTest(key, emailTemplates[key]);
  });

  registerSuite(suite);
});
