var test = require('tap').test;
var path = require('path');

test('exports correct components', function (t) {
  var index = require('../index');
  t.true(Array.isArray(index.l10n.supportedLanguages));
  t.end();
});
