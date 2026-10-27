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

type Tags = Record<string, string | number>;

export function captureException(err: Error, tags?: Tags) {
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
    if (tags) scope.setTags(tags);
    Sentry.captureException(err);
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel,
  tags?: Tags
) {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.withScope((scope: Sentry.Scope) => {
    if (tags) scope.setTags(tags);
    Sentry.captureMessage(message, level);
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
        return beforeSendBrowser(opts, event, hint);
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
  captureMessage,
  enable: enableSentry,
  disable: disableSentry,
};
