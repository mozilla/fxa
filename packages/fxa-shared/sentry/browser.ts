/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { SamplingContext } from '@sentry/core';
import { SentryConfigOpts } from './models/SentryConfigOpts';
import { ILogger } from '../log';
import { tagFxaName } from './tag';
import { buildSentryConfig } from './config-builder';

/**
 * Query parameters we allow to propagate to sentry
 */
const ALLOWED_QUERY_PARAMETERS = [
  'automatedBrowser',
  'client_id',
  'context',
  'entrypoint',
  'keys',
  'migration',
  'redirect_uri',
  'scope',
  'service',
  'setting',
  'style',
];

/**
 * Exception fields that are imported as tags
 */
const EXCEPTION_TAGS = ['code', 'context', 'errno', 'namespace', 'status'];

// Internal flag to keep track of whether or not sentry is initialized
let sentryEnabled = false;

// HACK: allow tests to stub this function from Sentry
// https://stackoverflow.com/questions/35240469/how-to-mock-the-imports-of-an-es6-module
export const _Sentry = {
  captureException: Sentry.captureException,
  close: Sentry.close,
};

/**
 * function that gets called before data gets sent to error metrics
 *
 * @param {Object} event
 *  Error object data
 * @returns {Object} data
 *  Modified error object data
 * @private
 */
function beforeSend(
  opts: SentryConfigOpts,
  event: Sentry.ErrorEvent,
  hint?: Sentry.EventHint
) {
  if (sentryEnabled === false) {
    return null;
  }

  if (event.request) {
    if (event.request.url) {
      event.request.url = cleanUpQueryParam(event.request.url);
    }

    if (event.tags) {
      // if this is a known errno, then use grouping with fingerprints
      // Docs: https://docs.sentry.io/hosted/learn/rollups/#fallback-grouping
      if (event.tags.errno) {
        event.fingerprint = ['errno' + (event.tags.errno as number)];
        // if it is a known error change the error level to info.
        event.level = 'info';
      }
    }

    if (event.exception?.values) {
      event.exception.values.forEach((value: Sentry.Exception) => {
        if (value.stacktrace && value.stacktrace.frames) {
          value.stacktrace.frames.forEach((frame: { abs_path?: string }) => {
            if (frame.abs_path) {
              frame.abs_path = cleanUpQueryParam(frame.abs_path); // eslint-disable-line camelcase
            }
          });
        }
      });
    }

    if (event.request.headers?.Referer) {
      event.request.headers.Referer = cleanUpQueryParam(
        event.request.headers.Referer
      );
    }
  }

  event = tagFxaName(event, opts.sentry?.clientName || opts.sentry?.serverName);
  return event;
}

/**
 * Overwrites sensitive query parameters with a dummy value.
 *
 * @param {String} url
 * @returns {String} url
 * @private
 */
function cleanUpQueryParam(url = '') {
  const urlObj = new URL(url);

  if (!urlObj.search.length) {
    return url;
  }

  // Iterate the search parameters.
  urlObj.searchParams.forEach((_, key) => {
    if (!ALLOWED_QUERY_PARAMETERS.includes(key)) {
      // if the param is a PII (not allowed) then reset the value.
      urlObj.searchParams.set(key, 'VALUE');
    }
  });

  return urlObj.href;
}

function captureException(err: Error) {
  if (!sentryEnabled) {
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
    _Sentry.captureException(err);
  });
}

function disable() {
  sentryEnabled = false;
}

function enable() {
  sentryEnabled = true;
}

function configure(config: SentryConfigOpts, log?: ILogger) {
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
  disable();

  const opts = buildSentryConfig(config, log);

  // If tracing is configured, add the integration.
  const integrations = [];
  if (opts.tracesSampleRate || opts.tracesSampler) {
    integrations.push(Sentry.browserTracingIntegration())
  }

  try {
    Sentry.init({
      ...opts,
      beforeSend: function (event: Sentry.ErrorEvent, hint?: Sentry.EventHint) {
        return beforeSend(opts, event, hint);
      },
      integrations,
    });
  } catch (e) {
    log.error(e);
  }
}

export default {
  configure,
  captureException,
  disable,
  enable,
  __sentryEnabled: function () {
    return sentryEnabled;
  },
  __beforeSend: beforeSend,
  __cleanUpQueryParam: cleanUpQueryParam,
};
