/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Hoek = require('@hapi/hoek');
const Sentry = require('@sentry/node');
const version = require('../package.json').version;

async function configureSentry(server, config, log) {
  const sentryDsn = config.sentryDsn;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      release: version,
      integrations: [
        new Sentry.Integrations.LinkedErrors({ key: 'jse_cause' }),
      ],
    });

    Sentry.configureScope(scope => {
      scope.setTag('process', 'customs_server');
    });

    // Attach a new Sentry scope to the request for breadcrumbs/tags/extras
    server.ext({
      type: 'onRequest',
      method(request, h) {
        request.sentryScope = new Sentry.Scope();
        return h.continue;
      },
    });
    log.info({ op: 'sentryEnabled' });
  } else {
    log.info({ op: 'sentryDisabled' });
  }

  // Sentry handler for hapi errors
  server.events.on({ name: 'request', channels: 'error' }, (request, event) => {
    const err = (event && event.error) || null;

    if (sentryDsn) {
      let exception = '';
      if (err && err.stack) {
        try {
          exception = err.stack.split('\n')[0];
        } catch (e) {
          // ignore bad stack frames
        }
      }
      Sentry.withScope(scope => {
        scope.addEventProcessor(_sentryEvent => {
          const sentryEvent = Sentry.Handlers.parseRequest(
            _sentryEvent,
            request.raw.req
          );
          sentryEvent.level = Sentry.Severity.Error;
          return sentryEvent;
        });
        scope.setExtra('exception', exception);

        // Merge the request scope into the temp scope
        Hoek.merge(scope, request.sentryScope);
        Sentry.captureException(err);
      });
    }

    log.error({ op: 'error', message: err.message });
  });
}

module.exports = { configureSentry };
