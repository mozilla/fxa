/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const P = require('../promise');

const ACTIVITY_EVENTS = new Set([
  'account.changedPassword',
  'account.confirmed',
  'account.created',
  'account.deleted',
  'account.keyfetch',
  'account.login',
  'account.reset',
  'account.signed',
  'account.verified',
  'device.created',
  'device.deleted',
  'device.updated',
  'sync.sentTabToDevice',
]);

// We plan to emit a vast number of flow events to cover all
// kinds of success and error steps of the sign-in/up journey.
// It's far easier to define the events that *aren't* a flow
// event than it is to define those that are.
const NOT_FLOW_EVENTS = new Set([
  'account.changedPassword',
  'account.deleted',
  'device.created',
  'device.deleted',
  'device.updated',
  'sync.sentTabToDevice',
]);

// It's an error if a flow event doesn't have a flow_id
// but some events are also emitted outside of user flows.
// Don't log an error for those events.
const OPTIONAL_FLOW_EVENTS = {
  'account.keyfetch': true,
  'account.reset': true,
  'account.signed': true,
};

const IGNORE_FLOW_EVENTS_FROM_SERVICES = {
  'account.signed': 'content-server',
};

const IGNORE_ROUTE_FLOW_EVENTS_FOR_PATHS = new Set([
  '/account/devices',
  '/account/profile',
  '/account/sessions',
  '/certificate/sign',
  '/password/forgot/status',
  '/recovery_email/status',
]);

const IGNORE_ROUTE_FLOW_EVENTS_REGEX = /^\/recoveryKey\/[0-9A-Fa-f]+$/;

const PATH_PREFIX = /^\/v1/;

module.exports = (log, config) => {
  const amplitude = require('./amplitude')(log, config);

  return {
    /**
     * Asynchronously emit a flow event and/or an activity event.
     *
     * @name emitMetricsEvent
     * @this request
     * @param {String} event
     * @param {Object} [data]
     * @returns {Promise}
     */
    emit(event, data) {
      if (!event) {
        log.error('metricsEvents.emit', { missingEvent: true });
        return P.resolve();
      }

      const request = this;
      let isFlowCompleteSignal = false;

      return P.resolve()
        .then(() => {
          if (ACTIVITY_EVENTS.has(event)) {
            emitActivityEvent(event, request, data);
          }
        })
        .then(() => {
          if (NOT_FLOW_EVENTS.has(event)) {
            return;
          }

          const service = request.query && request.query.service;
          if (service && IGNORE_FLOW_EVENTS_FROM_SERVICES[event] === service) {
            return;
          }

          return emitFlowEvent(event, request, data);
        })
        .then(metricsContext => {
          if (metricsContext) {
            isFlowCompleteSignal = event === metricsContext.flowCompleteSignal;
            return metricsContext;
          }

          return request.gatherMetricsContext({});
        })
        .then(metricsContext => {
          return amplitude(event, request, data, metricsContext).then(() => {
            if (isFlowCompleteSignal) {
              log.flowEvent(
                Object.assign({}, metricsContext, { event: 'flow.complete' })
              );
              return amplitude(
                'flow.complete',
                request,
                data,
                metricsContext
              ).then(() => request.clearMetricsContext());
            }
          });
        });
    },

    /**
     * Asynchronously emit a flow event indicating the route response.
     *
     * @name emitRouteFlowEvent
     * @this request
     * @param {Object} response
     * @returns {Promise}
     */
    emitRouteFlowEvent(response) {
      const request = this;
      const path = request.path.replace(PATH_PREFIX, '');
      let status = response.statusCode || response.output.statusCode;

      if (
        status === 404 ||
        IGNORE_ROUTE_FLOW_EVENTS_FOR_PATHS.has(path) ||
        IGNORE_ROUTE_FLOW_EVENTS_REGEX.test(path)
      ) {
        return P.resolve();
      }

      if (status >= 400) {
        const errno =
          response.errno || (response.output && response.output.errno);
        if (
          errno === error.ERRNO.INVALID_PARAMETER &&
          !request.validateMetricsContext()
        ) {
          // Don't emit flow events if the metrics context failed validation
          return P.resolve();
        }

        status = `${status}.${errno || 999}`;
      }

      return emitFlowEvent(`route.${path}.${status}`, request).then(data => {
        if (status >= 200 && status < 300) {
          // Limit to success responses so that short-cut logic (e.g. errors, 304s)
          // doesn't skew distribution of the performance data
          return emitPerformanceEvent(path, request, data);
        }
      });
    },
  };

  function emitActivityEvent(event, request, data) {
    const { location } = request.app.geo;
    data = Object.assign(
      {
        country: location && location.country,
        event,
        region: location && location.state,
        userAgent: request.headers['user-agent'],
      },
      data
    );

    optionallySetService(data, request);

    log.activityEvent(data);
  }

  function emitFlowEvent(event, request, optionalData) {
    if (!request || !request.headers) {
      log.error('metricsEvents.emitFlowEvent', { event, badRequest: true });
      return P.resolve();
    }

    const { location } = request.app.geo;
    return request
      .gatherMetricsContext({
        country: location && location.country,
        event: event,
        locale: request.app && request.app.locale,
        region: location && location.state,
        userAgent: request.headers['user-agent'],
      })
      .then(data => {
        if (data.flow_id) {
          const uid = coalesceUid(optionalData, request);
          if (uid) {
            data.uid = uid;
          }

          log.flowEvent(data);
        } else if (!OPTIONAL_FLOW_EVENTS[event]) {
          log.error('metricsEvents.emitFlowEvent', {
            event,
            missingFlowId: true,
          });
        }

        return data;
      });
  }

  function emitPerformanceEvent(path, request, data) {
    return log.flowEvent(
      Object.assign({}, data, {
        event: `route.performance.${path}`,
        flow_time: Date.now() - request.info.received,
      })
    );
  }
};

function optionallySetService(data, request) {
  if (data.service) {
    return;
  }

  data.service =
    (request.payload && request.payload.service) ||
    (request.query && request.query.service);
}

function coalesceUid(data, request) {
  if (data && data.uid) {
    return data.uid;
  }

  return (
    request.auth && request.auth.credentials && request.auth.credentials.uid
  );
}
