/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test;
var localizeTimestamp = require('../../l10n/localizeTimestamp');

test('default usage', function (t) {
  var format = localizeTimestamp({
    supportedLanguages: ['ar', 'az', 'bg', 'cs', 'cy', 'da', 'de', 'dsb', 'en', 'en-GB', 'es', 'ru'],
    defaultLanguage: 'en'
  }).format;

  t.equal(format(), '', 'empty if no timestamp');
  t.equal(format(Date.now() - 10), 'a few seconds ago', 'default language if no header');
  t.equal(format(Date.now() - 10, 'qu,ru;q=0.8,en-GB;q=0.5,en;q=0.3'), 'несколько секунд назад', 'ru translation with good header');
  t.equal(format(Date.now() - 10, 'ru'), 'несколько секунд назад', 'ru translation');
  t.equal(format(Date.now() - 10, 'qu'), 'a few seconds ago', 'default language if lang not supported');
  t.equal(format(Date.now() - 10, 'q=0.8'), 'a few seconds ago', 'default language if no locales in header');
  t.equal(format(Date.now() - 10, 'es-mx, ru'), 'hace unos segundos', 'LCID string takes priority');
  t.end();
});

test('no supported languages', function (t) {
  var format = localizeTimestamp({
    supportedLanguages: [],
    defaultLanguage: 'en'
  }).format;

  t.equal(format(), '', 'empty if no timestamp');
  t.equal(format(Date.now() - 10), 'a few seconds ago', 'default language');
  t.equal(format(Date.now() - 10, 'qu,ru;q=0.8,en-GB;q=0.5,en;q=0.3'), 'a few seconds ago', 'default language');
  t.equal(format(Date.now() - 10, 'ru'), 'a few seconds ago', 'default language');
  t.equal(format(Date.now() - 10, 'qu'), 'a few seconds ago', 'default language');
  t.equal(format(Date.now() - 10, 'q=0.8'), 'a few seconds ago', 'default language');
  t.equal(format(Date.now() - 10, 'es-mx, ru'), 'a few seconds ago', 'default language');
  t.end();
});

test('throws if no default language', function (t) {
  t.throws(
    function () {
      localizeTimestamp({
        supportedLanguages: ['en']
      });
    }, new Error('defaultLanguage is required'));
  t.end();
});
