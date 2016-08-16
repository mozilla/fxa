/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test;
var path = require('path');

test('returns an array of languages', function (t) {
  var languages = require(path.join(__dirname, '..', '..', 'l10n', 'supportedLanguages'));
  t.true(Array.isArray(languages), 'requires an array');
  t.true(languages.indexOf('es') >= 0, 'can get values');
  t.end();
});
