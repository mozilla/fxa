/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const config = require('../config');
const AppError = require('../error');

const ACTION_TO_PATHNAMES = {
  'email': '',
  'signin': 'signin',
  'signup': 'signup',
  'force_auth': 'force_auth'
};

function actionToPathname(action) {
  if (action === undefined) {
    return '';
  }

  if (ACTION_TO_PATHNAMES.hasOwnProperty(action)) {
    return ACTION_TO_PATHNAMES[action];
  }

  throw new Error('Bad action parameter');
}

module.exports = {
  handler: function redirectAuthorization(req, reply) {
    var redirect = url.parse(config.get('contentUrl'), true);
    var err = false;

    try {
      redirect.pathname += actionToPathname(req.query.action, reply);
    } catch (e) {
      err = true;
      reply(AppError.invalidRequestParameter('action'));
    }

    if (! err) {
      if (req.query.action !== 'email') {
        // only `action=email` is propagated as a hint
        // to the content server to show the email-first
        // flow. All other actions redirect to a named
        // endpoint.
        delete req.query.action;
      }

      if (req.query.login_hint && ! req.query.email) {
        req.query.email = req.query.login_hint;
        delete req.query.login_hint;
      }

      redirect.query = req.query;

      delete redirect.search;
      delete redirect.path;
      reply().redirect(url.format(redirect));
    }
  }
};
