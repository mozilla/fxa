/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const contentUrl = require('../config').get('contentUrl');
const AppError = require('../error');

module.exports = {
  handler: async function redirectAuthorization(req, h) {
    // keys_jwk is barred from transiting the OAuth server
    // to prevent a malicious OAuth server from stealing
    // a user's Scoped Keys. See bz1456351
    if (req.query.keys_jwk) {
      throw AppError.invalidRequestParameter('keys_jwk');
    }

    const redirect = url.parse(contentUrl, true);
    redirect.pathname = '/authorization';
    redirect.query = req.query;
    redirect.search = req.search;

    return h.redirect(url.format(redirect));
  },
};
