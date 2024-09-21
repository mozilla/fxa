/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const fs = require('fs');
const Hapi = require('@hapi/hapi');
const HapiSwagger = require('hapi-swagger');
const path = require('path');
const { getRemoteAddressChain } = require('./getRemoteAddressChain');
const userAgent = require('fxa-shared/lib/user-agent').parseToScalars;
const schemeRefreshToken = require('./routes/auth-schemes/refresh-token');
const authOauth = require('./routes/auth-schemes/auth-oauth');
const sharedSecretAuth = require('./routes/auth-schemes/shared-secret');
const pubsubAuth = require('./routes/auth-schemes/pubsub');
const googleOIDC = require('./routes/auth-schemes/google-oidc');
const { HEX_STRING } = require('./routes/validators');
const { configureSentry } = require('./sentry');
const { swaggerOptions } = require('../docs/swagger/swagger-options');
const { Account } = require('fxa-shared/db/models/auth');
const { determineLocale } = require('../../../libs/shared/l10n/src');
const {
  reportValidationError,
} = require('fxa-shared/sentry/report-validation-error');
const { logErrorWithGlean } = require('./metrics/glean');

function trimLocale(header) {
  if (!header) {
    return header;
  }
  if (header.length < 256) {
    return header.trim();
  }
  const parts = header.split(',');
  let str = parts[0];
  if (str.length >= 255) {
    return null;
  }
  for (let i = 1; i < parts.length && str.length + parts[i].length < 255; i++) {
    str += `,${parts[i]}`;
  }
  return str.trim();
}

function logValidationError(response, log) {
  log.error('server.ValidationError', response);
  reportValidationError(response.stack, response);
}

function logEndpointErrors(response, log) {
  // When requests to DB timeout and fail for unknown reason they are an 'EndpointError'.
  // The error response hides error information from the user, but we log it here
  // to better understand the DB timeouts.
  if (response.__proto__ && response.__proto__.name === 'EndpointError') {
    const endpointLog = {
      message: response.message,
      reason: response.reason,
    };
    if (response.attempt && response.attempt.method) {
      // log the DB attempt to understand the action
      endpointLog.method = response.attempt.method;
    }
    log.error('server.EndpointError', endpointLog);
  }
}

function translateStripeErrors(response) {
  if (response?.type === 'StripeAuthenticationError') {
    response.output = {
      statusCode: response.statusCode,
      payload: {
        ...response.output.payload,
        statusCode: response.statusCode,
        error: response.type,
        message: response.message,
      },
    };
  }

  return response;
}

async function create(log, error, config, routes, db, statsd, glean) {
  const getGeoData = require('./geodb')(log);
  const metricsContext = require('./metrics/context')(log, config);
  const metricsEvents = require('./metrics/events')(log, config, glean);
  const { sharedSecret: SUBSCRIPTIONS_SECRET } = config.subscriptions;

  function makeCredentialFn(dbGetFn) {
    return function (id) {
      log.trace('DB.getToken', { id: id });
      if (!HEX_STRING.test(id)) {
        return null;
      }

      return (async () => {
        const token = await dbGetFn(id);
        if (!token.expired(Date.now())) {
          return token;
        }

        const err = error.invalidToken('The authentication token has expired');
        if (token.constructor.tokenTypeID === 'sessionToken') {
          return (async () => {
            try {
              await db.pruneSessionTokens(token.uid, [token]);
            } catch (ignoreError) {
              // Ignore errors
            }
            throw err;
          })();
        }
        return null;
      })();
    };
  }

  const serverOptions = {
    host: config.listen.host,
    port: config.listen.port,
    routes: {
      cors: {
        additionalExposedHeaders: ['Timestamp', 'Accept-Language'],
        additionalHeaders: ['sentry-trace', 'baggage'],
        // If we're accepting CORS from any origin then use Hapi's "ignore" mode,
        // which is more forgiving of missing Origin header.
        origin: config.corsOrigin[0] === '*' ? 'ignore' : config.corsOrigin,
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubdomains: true,
        },
      },
      state: {
        parse: false,
      },
      payload: {
        maxBytes: 16384,
      },
      files: {
        relativeTo: path.dirname(__dirname),
      },
      validate: {
        options: {
          stripUnknown: true,
        },
        failAction: async (request, h, err) => {
          // Starting with Hapi 17, the framework hides the validation info
          // We want the full validation information and use it in `onPreResponse` below

          // See: https://github.com/hapijs/hapi/issues/3706#issuecomment-349765943
          throw err;
        },
      },
      response: { options: { abortEarly: false } },
    },
    load: {
      sampleInterval: 1000,
      maxEventLoopDelay: config.maxEventLoopDelay,
    },
  };

  if (config.useHttps) {
    serverOptions.tls = {
      key: fs.readFileSync(config.keyPath),
      cert: fs.readFileSync(config.certPath),
    };
  }

  const server = new Hapi.Server(serverOptions);
  server.validator(require('joi'));

  server.ext('onRequest', (request, h) => {
    log.begin('server.onRequest', request);
    return h.continue;
  });

  server.ext('onPreAuth', (request, h) => {
    defineLazyGetter(request.app, 'remoteAddressChain', () => {
      return getRemoteAddressChain(request, config.remoteAddressChainOverride);
    });

    defineLazyGetter(request.app, 'clientAddress', () => {
      const remoteAddressChain = request.app.remoteAddressChain;
      let clientAddressIndex =
        remoteAddressChain.length - (config.clientAddressDepth || 1);

      if (clientAddressIndex < 0) {
        clientAddressIndex = 0;
      }

      return remoteAddressChain[clientAddressIndex];
    });

    defineLazyGetter(request.app, 'acceptLanguage', () =>
      trimLocale(request.headers['accept-language'])
    );
    defineLazyGetter(request.app, 'locale', () =>
      determineLocale(request.app.acceptLanguage)
    );

    defineLazyGetter(request.app, 'ua', () =>
      userAgent(request.headers['user-agent'])
    );
    defineLazyGetter(request.app, 'geo', () =>
      getGeoData(request.app.clientAddress)
    );
    defineLazyGetter(request.app, 'metricsContext', () =>
      metricsContext.get(request)
    );

    defineLazyGetter(request.app, 'devices', () => {
      let uid;

      if (
        request.auth &&
        request.auth.credentials &&
        request.auth.credentials.uid
      ) {
        // sessionToken strategy comes with uid as uid
        uid = request.auth.credentials.uid;
      } else if (
        request.auth &&
        request.auth.credentials &&
        request.auth.credentials.user
      ) {
        // oauthToken strategy comes with uid as user
        uid = request.auth.credentials.user;
      } else if (request.payload && request.payload.uid) {
        uid = request.payload.uid;
      }

      return db.devices(uid);
    });

    defineLazyGetter(request.app, 'isMetricsEnabled', async () => {
      // This catches most but not all cases where the given uid
      // is opted out and saves us from making a db call further down.
      // Note that unverified accounts can not be opted out of metrics.

      let uid;
      if (
        request.auth &&
        request.auth.credentials &&
        request.auth.credentials.uid
      ) {
        // sessionToken strategy sets this property already
        return !request.auth.credentials.metricsOptOutAt;
      } else if (
        request.auth &&
        request.auth.credentials &&
        request.auth.credentials.user
      ) {
        // oauthToken strategy comes with uid as user
        uid = request.auth.credentials.user;
      } else if (request.payload && request.payload.uid) {
        // Some unauthenticated requests might set uid in payload, ex. `/account/status`
        uid = request.payload.uid;
      } else if (request.app.metricsEventUid) {
        // For access tokens, and webhooks, we stash the uid
        uid = request.app.metricsEventUid;
      } else if (request.payload && request.payload.email) {
        // last resort is to check if an email is in the payload
        try {
          const account = await Account.findByPrimaryEmail(
            request.payload.email
          );
          uid = account.uid;
        } catch (err) {
          // Unknown accounts will have the default experience
        }
      }

      if (!uid) {
        return true;
      }

      return Account.metricsEnabled(uid);
    });

    if (request.headers.authorization) {
      // Log some helpful details for debugging authentication problems.
      log.trace('server.onPreAuth', {
        rid: request.id,
        path: request.path,
        auth: request.headers.authorization,
        type: request.headers['content-type'] || '',
      });
    }

    return h.continue;
  });

  server.ext('onPreHandler', (request, h) => {
    const features = request.payload && request.payload.features;
    request.app.features = new Set(Array.isArray(features) ? features : []);

    return h.continue;
  });

  server.ext('onPreResponse', (request, h) => {
    let response = request.response;
    if (response.isBoom) {
      logEndpointErrors(response, log);
      logErrorWithGlean({ glean, request, error: response });

      // Do not log errors that either aren't a validation error or have a status code below 500
      // ValidationError that are 4xx status are request validation errors
      if (
        response?.__proto__.name === 'ValidationError' &&
        response.output &&
        response.output.statusCode >= 500
      ) {
        logValidationError(response, log);
      }

      if (config.env !== 'prod') {
        translateStripeErrors(response);
      }

      response = error.translate(request, response);
      if (config.env !== 'prod') {
        response.backtrace(request.app.traced);
      }
    }
    response.header('Timestamp', `${Math.floor(Date.now() / 1000)}`);
    return response;
  });

  const metricReporter = metricFactory(statsd);
  server.events.on('response', (request) => {
    log.summary(request, request.response);
    metricReporter(request);
  });

  // Configure Sentry... Note, Sentry will already be initialized by this point,
  // but this will add a couple hooks into hapi request life cycle so that transactions
  // can be created.
  await configureSentry(server, config);

  server.decorate('request', 'stashMetricsContext', metricsContext.stash);
  server.decorate('request', 'gatherMetricsContext', metricsContext.gather);
  server.decorate(
    'request',
    'propagateMetricsContext',
    metricsContext.propagate
  );
  server.decorate('request', 'clearMetricsContext', metricsContext.clear);
  server.decorate('request', 'validateMetricsContext', metricsContext.validate);
  server.decorate(
    'request',
    'setMetricsFlowCompleteSignal',
    metricsContext.setFlowCompleteSignal
  );

  server.decorate('request', 'emitMetricsEvent', metricsEvents.emit);
  server.decorate(
    'request',
    'emitRouteFlowEvent',
    metricsEvents.emitRouteFlowEvent
  );

  server.stat = function () {
    return {
      stat: 'mem',
      rss: server.load.rss,
      heapUsed: server.load.heapUsed,
    };
  };

  await server.register(require('hapi-auth-jwt2'));

  const hawkFxAToken = require('./routes/auth-schemes/hawk-fxa-token');
  // Register auth strategies for all token types. These strategies support Hawk (without validation) and FxA token types.
  server.auth.scheme(
    'fxa-hawk-session-token',
    hawkFxAToken.strategy(makeCredentialFn(db.sessionToken.bind(db)))
  );
  server.auth.scheme(
    'fxa-hawk-keyFetch-token',
    hawkFxAToken.strategy(makeCredentialFn(db.keyFetchToken.bind(db)))
  );
  server.auth.scheme(
    'fxa-hawk-keyFetch-with-verification-token',
    hawkFxAToken.strategy(
      makeCredentialFn(db.keyFetchTokenWithVerificationStatus.bind(db))
    )
  );
  server.auth.scheme(
    'fxa-hawk-accountReset-token',
    hawkFxAToken.strategy(makeCredentialFn(db.accountResetToken.bind(db)))
  );
  server.auth.scheme(
    'fxa-hawk-passwordForgot-token',
    hawkFxAToken.strategy(makeCredentialFn(db.passwordForgotToken.bind(db)))
  );
  server.auth.scheme(
    'fxa-hawk-passwordChange-token',
    hawkFxAToken.strategy(makeCredentialFn(db.passwordChangeToken.bind(db)))
  );

  // the recoveryKey/exists route accepts a session token or a password-forgot
  // token.  in order for Hapi to try all the strategies (until auth succeeds),
  // the strategy's authenticate function _must not_ throw on failed
  // authentication. otherwise, Hapi will stop at the first strategy that
  // throws.
  server.auth.scheme(
    'multi-strategy-fxa-hawk-session-token',
    hawkFxAToken.strategy(makeCredentialFn(db.sessionToken.bind(db)), {
      throwOnFailure: false,
    })
  );
  server.auth.scheme(
    'multi-strategy-fxa-hawk-passwordForgot-token',
    hawkFxAToken.strategy(makeCredentialFn(db.passwordForgotToken.bind(db)), {
      throwOnFailure: false,
    })
  );

  server.auth.strategy('sessionToken', 'fxa-hawk-session-token');
  server.auth.strategy('keyFetchToken', 'fxa-hawk-keyFetch-token');
  server.auth.strategy(
    // This strategy fetches the keyFetchToken with its
    // verification state. It doesn't check that state.
    'keyFetchTokenWithVerificationStatus',
    'fxa-hawk-keyFetch-with-verification-token'
  );
  server.auth.strategy('accountResetToken', 'fxa-hawk-accountReset-token');
  server.auth.strategy('passwordForgotToken', 'fxa-hawk-passwordForgot-token');
  server.auth.strategy('passwordChangeToken', 'fxa-hawk-passwordChange-token');

  server.auth.strategy(
    'multiStrategySessionToken',
    'multi-strategy-fxa-hawk-session-token'
  );
  server.auth.strategy(
    'multiStrategyPasswordForgotToken',
    'multi-strategy-fxa-hawk-passwordForgot-token'
  );

  server.auth.scheme(authOauth.AUTH_SCHEME, authOauth.strategy);
  server.auth.strategy('oauthToken', authOauth.AUTH_SCHEME, config.oauth);

  server.auth.scheme('fxa-oauth-refreshToken', schemeRefreshToken(config, db));

  server.auth.strategy('refreshToken', 'fxa-oauth-refreshToken');

  server.auth.scheme(
    'subscriptionsSecret',
    sharedSecretAuth.strategy(SUBSCRIPTIONS_SECRET)
  );
  server.auth.strategy('subscriptionsSecret', 'subscriptionsSecret');

  server.auth.scheme(
    'supportSecret',
    sharedSecretAuth.strategy(`Bearer ${config.support.secretBearerToken}`, {
      throwOnFailure: false,
    })
  );
  server.auth.strategy('supportSecret', 'supportSecret');

  server.auth.strategy('pubsub', 'jwt', pubsubAuth.strategy(config));

  server.auth.scheme(
    'cloudTasksOIDC',
    googleOIDC.strategy(config.cloudTasks.oidc)
  );
  server.auth.strategy('cloudTasksOIDC', 'cloudTasksOIDC');

  server.auth.scheme(
    'cloudSchedulerOIDC',
    googleOIDC.strategy(config.cloudScheduler.oidc)
  );
  server.auth.strategy('cloudSchedulerOIDC', 'cloudSchedulerOIDC');

  // register all plugins and Swagger configuration
  await server.register([
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  // routes should be registered after all auth strategies have initialized:
  // ref: http://hapijs.com/tutorials/auth

  server.route(routes);
  return server;
}

function defineLazyGetter(object, key, getter) {
  let value;
  Object.defineProperty(object, key, {
    get() {
      if (!value) {
        value = getter();
      }

      return value;
    },
  });
}

/**
 * Extracted from hapi-statsd but modified to work with hotshots.
 * The following function contains MIT licensed code from:
 *    https://github.com/mac-/hapi-statsd/blob/master/lib/hapi-statsd.js
 */
function metricFactory(statsdClient) {
  const pathSeparator = '_';

  function normalizePath(path) {
    path = path.indexOf('/') === 0 ? path.substr(1) : path;
    return path.replace(/\//g, pathSeparator);
  }

  function reportMetrics(request) {
    const statusCode = request.response.isBoom
      ? request.response.output.statusCode
      : request.response.statusCode;

    const errno =
      request.response.errno ||
      (request.response.source && request.response.source.errno) ||
      0;

    let path = request._route.path;
    const specials = request._core.router.specials;

    if (request._route === specials.notFound.route) {
      path = '/{notFound*}';
    } else if (specials.options && request._route === specials.options.route) {
      path = '/{cors*}';
    } else if (
      request._route.path === '/' &&
      request._route.method === 'options'
    ) {
      path = '/{cors*}';
    }

    statsdClient.timing(
      'url_request',
      request.info.completed - request.info.received,
      1,
      {
        path: normalizePath(path),
        method: request.method.toUpperCase(),
        statusCode,
        errno,
      }
    );
  }
  return reportMetrics;
}

module.exports = {
  create: create,
  // Functions below exported for testing
  _configureSentry: configureSentry,
  _logEndpointErrors: logEndpointErrors,
  _logValidationError: logValidationError,
  _trimLocale: trimLocale,
};
