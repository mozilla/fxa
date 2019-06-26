/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// Mostly intended to detect possible failures in packaging production builds,
// but should be expected to pass against latest.dev.lcip.org as well.
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const got = require('got');
const util = require('util');
const fxaShared = require('fxa-shared');
var languages = fxaShared.l10n.supportedLanguages;
var httpsUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

var suite = {
  tests: {},
};

function langTest(lang) {
  var options = {
    headers: {
      'Accept-Language': lang,
    },
  };

  function normalizeLanguage(lang) {
    // A quirk of i18n normalization. Whatever.
    if (lang === 'sr-LATN') {
      lang = 'sr-Latn';
    }
    return lang;
  }

  suite.tests['#https get ' + httpsUrl + '/ -> ' + lang] = function() {
    var dfd = this.async(intern._config.asyncTimeout);
    got(httpsUrl + '/', options)
      .then(function(res) {
        assert.equal(res.statusCode, 200);
        var langRegExp = new RegExp(util.format('lang="?%s"?', lang));
        assert.ok(langRegExp.test(res.body), 'html has correct lang attribute');
        if (intern._config.fxaProduction) {
          var locale = normalizeLanguage(lang).replace('-', '_');
          var scriptRegExp = new RegExp(
            util.format('[0-9a-f]{40,40}/app.bundle.%s.js', locale)
          );
          assert.ok(
            scriptRegExp.test(res.body),
            'html has localized JavaScript'
          );
        }
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };

  suite.tests[
    '#https get ' + httpsUrl + '/i18n/client.json -> ' + lang
  ] = function() {
    var dfd = this.async(intern._config.asyncTimeout);
    got(httpsUrl + '/i18n/client.json', options)
      .then(function(res) {
        assert.equal(res.statusCode, 200);
        if (intern._config.fxaProduction) {
          // using the empty string '' as the key below is intentional
          var language = JSON.parse(res.body)[''].language;
          language = language.replace('_', '-'); // e.g., pt_BR -> pt-BR
          assert.equal(normalizeLanguage(lang), language);
        }
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };
}

languages.forEach(function(lang) {
  langTest(lang);
});

registerSuite(
  'load / and /i18n/client.json with various accept-languages',
  suite
);
