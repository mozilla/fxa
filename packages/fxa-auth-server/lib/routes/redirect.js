/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const config = require('../config');
const AppError = require('../error');

function actionToPathname(action) {
  if (action === 'signup') {
    return 'signup';
  } else if (action === 'force_auth') {
    return 'force_auth';
  } else if (action === 'signin') {
    return 'signin';
  } else if (action === undefined) {
    return '';
  }

  throw AppError.invalidRequestParameter('action');
}

module.exports = {
  handler: function redirectAuthorization(req, reply) {
    var redirect = url.parse(config.get('contentUrl'), true);

    redirect.pathname += actionToPathname(req.query.action);
    delete req.query.action;

    if (req.query.login_hint && !req.query.email) {
      req.query.email = req.query.login_hint;
      delete req.query.login_hint;
    }

    redirect.query = req.query;

    delete redirect.search;
    delete redirect.path;
    reply().redirect(url.format(redirect));
  }
};
