/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import {
  SentryConfigOpts,
  buildSentryConfig,
  Logger,
  beforeSendBrowser,
  disableSentry,
  enableSentry,
  isSentryEnabled,
} from '@fxa/shared/sentry-utils';

/**
 * Exception fields that are imported as tags
 */
const EXCEPTION_TAGS = ['code', 'context', 'errno', 'namespace', 'status'];

const BROWSER_ID_KEY = 'fxa_sentry_browser_id';

// Random id per browser, so Sentry can count affected users without a link to the account.
function getBrowserId(): string | undefined {
  try {
    let id = localStorage.getItem(BROWSER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(BROWSER_ID_KEY, id);
    }
    return id;
  } catch {
    // Storage can be blocked; the event goes out without an id.
    return undefined;
  }
}

export function captureException(err: Error) {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.withScope((scope: Sentry.Scope) => {
    EXCEPTION_TAGS.forEach((tagName) => {
      if (tagName in err) {
        scope.setTag(
          tagName,
          (
            err as {
              [key: string]: any;
            }
          )[tagName]
        );
      }
    });
    Sentry.captureException(err);
  });
}

export function initSentry(config: SentryConfigOpts, log?: Logger) {
  if (!log) {
    log = console;
  }

  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided');
    return;
  }

  // We want sentry to be disabled by default... This is because we only emit data
  // for users that 'have opted in'. A subsequent call to 'enable' is needed to ensure
  // that sentry events only flow under the proper circumstances.
  disableSentry();

  const opts = buildSentryConfig(config, log);
  try {
    Sentry.init({
      ...opts,
      beforeSend: function (event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
        const result = beforeSendBrowser(opts, event, hint);
        // Only create the id when an event really leaves the browser.
        const id = result && getBrowserId();
        if (id) {
          result.user = { ...result.user, id };
        }
        return result;
      },
      integrations:
        opts.tracesSampleRate || opts.tracesSampler
          ? [Sentry.browserTracingIntegration()]
          : [],
    });
  } catch (e) {
    log.error(e);
  }
}

export default {
  configure: initSentry,
  captureException,
  enable: enableSentry,
  disable: disableSentry,
};
