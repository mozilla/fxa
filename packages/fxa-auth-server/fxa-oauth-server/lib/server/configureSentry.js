/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Raven = require('raven');

function configureSentry(server, config) {
  const sentryDsn = config.sentryDsn;
  if (sentryDsn) {
    Raven.config(sentryDsn, {});
    server.events.on({ name: 'request', channels: 'error' }, function(req, ev) {
      const err = (ev && ev.error) || null;
      let exception = '';
      if (err && err.stack) {
        try {
          exception = err.stack.split('\n')[0];
        } catch (e) {
          // ignore bad stack frames
        }
      }

      Raven.captureException(err, {
        extra: {
          exception: exception,
        },
      });
    });
  }
}

module.exports = configureSentry;
