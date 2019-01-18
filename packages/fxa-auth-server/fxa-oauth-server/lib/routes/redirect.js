/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const contentUrl = require('../config').get('contentUrl');

module.exports = {
  handler: async function redirectAuthorization(req, h) {
    const redirect = url.parse(contentUrl, true);
    redirect.pathname = '/authorization';
    redirect.query = req.query;
    redirect.search = req.search;

    return h.redirect(url.format(redirect));
  }
};
