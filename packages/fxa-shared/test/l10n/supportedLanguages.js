var test = require('tap').test;
var path = require('path');

test('returns an array of languages', function (t) {
  var languages = require(path.join(__dirname, '..', '..', 'l10n', 'supportedLanguages'));
  t.true(Array.isArray(languages), 'requires an array');
  t.true(languages.indexOf('es') >= 0, 'can get values');
  t.end();
});
