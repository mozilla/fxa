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
  'intern/dojo/node!got',
  'intern/dojo/node!url',
  'intern/dojo/node!util',
  'intern/dojo/node!fxa-shared',
], function (intern, registerSuite, assert, config, got, url, util, fxaShared) {
  var languages = fxaShared.l10n.supportedLanguages;
  var httpsUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'load / and /i18n/client.json with various accept-languages'
  };

  function langTest(lang) {
    var options = {
      headers: {
        'Accept-Language': lang
      }
    };

    function normalizeLanguage(lang) {
      // A quirk of i18n normalization. Whatever.
      if (lang === 'sr-LATN') {
        lang = 'sr-Latn';
      }
      return lang;
    }

    suite['#https get ' + httpsUrl + '/ -> ' + lang] = function () {
      var dfd = this.async(intern.config.asyncTimeout);
      got(httpsUrl + '/', options)
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          var langRegExp = new RegExp(util.format('lang="%s"', lang));
          assert.ok(langRegExp.test(res.body), 'html has correct lang attribute');
          if (intern.config.fxaProduction) {
            var locale = normalizeLanguage(lang).replace('-', '_');
            var scriptRegExp = new RegExp(util.format('[0-9a-f]{8,8}\.main\.%s\.js', locale));
            assert.ok(scriptRegExp.test(res.body), 'html has localized JavaScript');
          }
        })
        .then(dfd.resolve, dfd.reject);
    };

    suite['#https get ' + httpsUrl + '/i18n/client.json -> ' + lang] = function () {
      var dfd = this.async(intern.config.asyncTimeout);
      got(httpsUrl + '/i18n/client.json', options)
        .then(function (res) {
          assert.equal(res.statusCode, 200);
          if (intern.config.fxaProduction) {
            // using the empty string '' as the key below is intentional
            var language = JSON.parse(res.body)[''].language;
            language = language.replace('_', '-'); // e.g., pt_BR -> pt-BR
            assert.equal(normalizeLanguage(lang), language);
          }
        })
        .then(dfd.resolve, dfd.reject);
    };
  }

  languages.forEach(function (lang) {
    langTest(lang);
  });

  registerSuite(suite);

});
