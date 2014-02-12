define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (registerSuite, assert, config, request) {
  'use strict';

  var serverUrl = config.get('public_url');

  var emailTemplates = {
    '/en/reset': {
      subject: /Reset Password/,
      text: /Reset password/,
      html: /Reset password/
    },
    '/it-CH/reset': {
      subject: /pɹoʍssaԀ ʇǝsǝᴚ/,
      text: /pɹoʍssad ʇǝsǝᴚ/,
      html: /pɹoʍssad ʇǝsǝᴚ/
    },
    '/en/verify': {
      subject: /Confirm/,
      text: /Verify/,
      html: /Verify/
    },
    '/it-CH/verify': {
      subject: /ɯɹıɟuoↃ/,
      text: /ʎɟıɹǝɅ/,
      html: /ʎɟıɹǝɅ/
    }
  };

  var suite = {
    name: 'email templates'
  };

  function emailTemplateTest(name, matches) {
    suite['#get email template for ' + name] = function() {
      var dfd = this.async(1000);

      request(serverUrl + '/template' + name, dfd.callback(function(err, res, body) {
          var json = JSON.parse(body);

          assert.match(json.subject, matches.subject);
          assert.match(json.text, matches.text);
          assert.match(json.html, matches.html);

        }, dfd.reject.bind(dfd)));
    };
  }

  Object.keys(emailTemplates).forEach(function(key) {
    emailTemplateTest(key, emailTemplates[key]);
  });

  registerSuite(suite);

});
