'use strict';

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Replace the builtin `dns.lookup` with one that will divert lookups of
// `alias` to a test `elb`. Useful for testing deployments before going live,
// specifically for `tests/server/l10n-entrained`.
//
// Caveats:
// - the `got` module appears to wind up using `dns.lookup`, but this is a
//   fragile assumption/implementation detail.
// - Written for node4; may need to be rewritten for more modern nodejs
//   major versions, but quite possibly not.

const dns = require('dns');
var originalLookup;

module.exports = function hookedLookup(elb, alias) {
  // remove the wrapped hook if first argument is literally `false`.
  if (elb === false && dns.lookup._wrapped && originalLookup) {
    dns.lookup = originalLookup;
    return;
  }

  if (!elb || !alias) {
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
