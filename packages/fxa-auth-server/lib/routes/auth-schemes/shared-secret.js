/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('../../error');
const crypto = require('crypto');

const constantTimeCompare = (subject, object) => {
  const size = Buffer.byteLength(object);
  return (
    crypto.timingSafeEqual(Buffer.alloc(size, subject), Buffer.from(object)) &&
    subject.length === object.length
  );
};

exports.strategy = (secret) => (server, options) => ({
  authenticate: (request, h) => {
    if (constantTimeCompare(request.headers.authorization, secret)) {
      return h.authenticated({ credentials: {} });
    }

    throw AppError.invalidToken();
  },
});
