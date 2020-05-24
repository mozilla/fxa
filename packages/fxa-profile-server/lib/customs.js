/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('./promise');
var Pool = require('./pool');
const AppError = require('./error');
const logger = require('./logging')('customs');
const config = require('./config').getProperties();

function Customs(options) {
  options = options || {};
  var url = options.url || config.customsUrl;

  if (url === 'none') {
    this.pool = {
      post: function () {
        return P.resolve({ block: false });
      },
      close: function () {},
    };
  } else {
    this.pool = new Pool(url, { timeout: 1000 });
  }
}

Customs.prototype.checkAuthenticated = function (action, ip, uid) {
  logger.info('customs.checkAuthenticated', {
    action: action,
    ip: ip,
    uid: uid,
  });

  return this.pool
    .post('/checkAuthenticated', {
      action: action,
      ip: ip,
      uid: uid,
    })
    .then(
      function (result) {
        if (result.block) {
          if (result.retryAfter) {
            throw AppError.tooManyRequests(result.retryAfter);
          }

          throw AppError.requestBlocked();
        }
      },
      function (err) {
        logger.error('customs.checkAuthenticated', {
          ip: ip,
          uid: uid,
          err: err,
        });

        // If this happens, either:
        // - (1) the url in config doesn't point to a real customs server
        // - (2) the customs server returned an internal server error
        // Either way, allow the request through so we fail open.
      }
    );
};

Customs.prototype.close = function () {
  return this.pool.close();
};

module.exports = function (options) {
  return new Customs(options);
};
