/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const config = require('../config');

module.exports = {
  handler: function redirectAuthorization(req, reply) {
    var redirect = url.parse(config.get('contentUrl'), true);
    redirect.query = req.query;
    delete redirect.search;
    delete redirect.path;
    reply().redirect(url.format(redirect));
  }
};
