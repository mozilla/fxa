'use strict';

// Replace the builtin `dns.lookup` with one that will divert lookups of
// `alias` to a test `elb`. Useful for testing deployments before going live,
// specifically for `tests/server/l10n-entrained`.
//
// Caveats:
// - the `got` module appears to wind up using `dns.lookup`, but this is a
//   fragile assumption.
// - no provision is made for unwrapping `dns.lookup`; maybe I should allow
//   for cleanup, but this module is not intended to be used outside of a
//   narrow testing use case.
// - Written for node4; may need to be rewritten for more modern nodejs
//   major versions.

const dns = require('dns');
var originalLookup;

module.exports = function hookedLookup(elb, alias) {
  if (! elb || ! alias) {
    return;
  }

  if (dns.lookup._wrapped) {
    return;
  }

  originalLookup = dns.lookup;

  dns.lookup = function lookup(hostname, options, callback) {
    if (hostname === alias) {
      return originalLookup(elb, options, callback);
    }

    originalLookup(hostname, options, callback);
  };

  dns.lookup._wrapped = true;
};
