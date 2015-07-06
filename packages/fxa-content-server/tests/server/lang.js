/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mostly intended to detect possible failures in packaging production builds,
// but should be expected to pass against latest.dev.lcip.org as well.

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request',
  'intern/dojo/node!url',
  'intern/dojo/node!util',
  'intern/dojo/node!../../server/config/production-locales',
], function (intern, registerSuite, assert, config, request, url, util, productionLocales) {

  var languages = productionLocales.i18n.supportedLanguages;
  var httpsUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'load / with various accept-languages'
  };

  function langTest(lang) {
    var options = {
      headers: {
        'Accept-Language': lang
      }
    };

    suite['#https get ' + httpsUrl + '/ -> ' + lang] = function () {
      var dfd = this.async(intern.config.asyncTimeout);
      request(httpsUrl + '/', options, dfd.callback(function (err, res) {
        assert.ok(! err);
        assert.equal(res.statusCode, 200);
        var re = new RegExp(util.format('lang="%s"', lang));
        assert.ok(res.body.match(re), 'html has correct lang attribute');
      }, dfd.reject.bind(dfd)));
    };

    suite['#https get ' + httpsUrl + '/i18n/client.json -> ' + lang] = function () {
      var dfd = this.async(intern.config.asyncTimeout);
      request(httpsUrl + '/i18n/client.json', options, dfd.callback(function (err, res) {
        assert.ok(! err);
        assert.equal(res.statusCode, 200);
        if (intern.config.fxaProduction) {
          // using the empty string '' as the key below is intentional
          var language = JSON.parse(res.body)[''].language;
          language = language.replace('_', '-'); // e.g., pt_BR -> pt-BR

          // sr-LATN is a mechanical translation of sr, but doesn't change the
          // language setting in the generated PO file. So adjust the expected.
          if (lang === 'sr-LATN') {
            lang = 'sr';
          }

          // sv is a straight copy of sv-SV, so adjust the expected value.
          // https://github.com/mozilla/fxa-content-server/blob/\
          //   558e5e6c788fbf87b880bc9e36649bdb74cb2096/grunttasks/copy.js#L16
          if (lang === 'sv') {
            lang = 'sv-SE';
          }

          assert.equal(lang, language);
        }
      }, dfd.reject.bind(dfd)));
    };
  }

  languages.forEach(function (lang) {
    langTest(lang);
  });

  registerSuite(suite);

});
