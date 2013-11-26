/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function Verifier(args) {
  if (!args) args = {};
  this.args = args;
  this.config = {};
}

Verifier.prototype.setFallback = function(idp) {
  this.config.fallback = idp.domain();
};

Verifier.prototype.start = function(cb) {
  cb('not implemented');
};

Verifier.prototype.stop = function(cb) {
  cb('not implemented');
};

module.exports = Verifier;
