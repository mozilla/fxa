/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const assert = require('assert');

// all the promise wrapping in tests makes it unclear who actually
// called mozlog incorrectly. So, record this location directly.
function getMozlogCallerLocation() {
  var err = new Error('getMozlogCallerLocation').stack.split('\n')[3];
  return err;
}

// no-op except check that first arg is a string, etc., a la mozlog
var noop = function () {
  assert(
    arguments.length <= 2,
    'mozlog takes a maximum of 2 arguments' +
      ', caller: ' +
      getMozlogCallerLocation()
  );
  assert.equal(
    typeof arguments[0],
    'string',
    'mozlog must take a String as first argument, got: ' +
      JSON.stringify(arguments[0]) +
      ', caller: ' +
      getMozlogCallerLocation()
  );
  assert.equal(
    arguments[0].indexOf(' '),
    -1,
    'mozlog first argument must not contain spaces, got "' +
      JSON.stringify(arguments[0]) +
      '"' +
      ', caller: ' +
      getMozlogCallerLocation()
  );
};

module.exports = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  stat: noop,
};
