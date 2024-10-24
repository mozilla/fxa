/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { captureException } from '@sentry/browser';
import { window } from './window';
import { v4 as uuid } from 'uuid';
import { QueryParams } from '..';
import { once } from './utilities';
import { useEffect } from 'react';
import { MetricsContext, MetricsContextKeys } from 'fxa-auth-client/browser';

export const settingsViewName = 'settings';

const NOT_REPORTED_VALUE = 'none';
const UNKNOWN_VALUE = 'unknown';

const flowEventDataDefaults = {
  broker: 'web',
  context: 'web',
  service: 'none',
  isSampledUser: false,
  deviceId: uuid().replace(/-/g, ''),
};

type Optional<T> = T | typeof NOT_REPORTED_VALUE;

type ScreenInfo = {
  clientHeight: Optional<number>;
  clientWidth: Optional<number>;
  devicePixelRatio: Optional<number>;
  height: Optional<number>;
  width: Optional<number>;
};

type EventSet = {
  offset: number;
  type: string;
};

type ExperimentGroup = {
  choice: string;
  group: string;
};

type UserPreferences = {
  [userPref: string]: boolean;
};

interface ConfigurableProperties extends Hash<any> {
  experiments: ExperimentGroup[];
  lang: string | typeof UNKNOWN_VALUE;
  newsletters: string[] | typeof NOT_REPORTED_VALUE;
  startTime: number;
  uid: Optional<string>;
  userPreferences: UserPreferences;
  utm_campaign: Optional<string>;
  utm_content: Optional<string>;
  utm_medium: Optional<string>;
  utm_source: Optional<string>;
  utm_term: Optional<string>;
  isSampleUser?: Optional<boolean>;
  broker?: Optional<string>;
}

type EventData = QueryParams &
  ConfigurableProperties & {
    duration: number;
    events: EventSet[];
    flushTime: number;
    referrer: string;
    screen: ScreenInfo;
    [additionalProperty: string]: any;
  };

let initialized = false;
let metricsEnabled = false;
let viewNamePrefix: string | null;
let flowEventData: QueryParams;
let configurableProperties: ConfigurableProperties = defaultConfigProps();

function defaultConfigProps(): ConfigurableProperties {
  const startTime = () => {
    return Date.now();
  };

  return {
    experiments: [],
    lang: UNKNOWN_VALUE,
    newsletters: NOT_REPORTED_VALUE,
    startTime: startTime(),
    uid: NOT_REPORTED_VALUE,
    userPreferences: {},
    utm_campaign: NOT_REPORTED_VALUE,
    utm_content: NOT_REPORTED_VALUE,
    utm_medium: NOT_REPORTED_VALUE,
    utm_source: NOT_REPORTED_VALUE,
    utm_term: NOT_REPORTED_VALUE,
  };
}

/**
 * Get user's window/screen info
 */
function getScreenInfo(): ScreenInfo {
  const documentElement = window.document.documentElement || {};
  const screen = window.screen || {};

  return {
    clientHeight: documentElement.clientHeight || NOT_REPORTED_VALUE,
    clientWidth: documentElement.clientWidth || NOT_REPORTED_VALUE,
    devicePixelRatio: window.devicePixelRatio || NOT_REPORTED_VALUE,
    height: screen.height || NOT_REPORTED_VALUE,
    width: screen.width || NOT_REPORTED_VALUE,
  };
}

/**
 * Send metrics data to the content-server metrics endpoint
 *
 * @param eventData
 */
async function postMetrics(eventData: EventData) {
  if (!metricsEnabled || !initialized || !window.navigator.sendBeacon) {
    return;
  }

  if ('keepalive' in new Request('')) {
    await fetch('/metrics', {
      method: 'POST',
      body: JSON.stringify(eventData),
      keepalive: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } else {
    window.navigator.sendBeacon('/metrics', JSON.stringify(eventData));
  }
}

/**
 * Toggles metrics collection
 */
export function setEnabled(value: boolean) {
  metricsEnabled = value;
}

/**
 * Reset Metrics setup; used for testing
 */
export function reset() {
  initialized = false;
  viewNamePrefix = null;
  flowEventData = {};
  configurableProperties = defaultConfigProps();
}

/**
 * Initialize FxA flow metrics recording
 *
 * If all flow data is not present, will redirect back to the
 * content-server to retrieve a new set of flow data
 *
 * @param flowQueryParams - Flow data sent via query params from the content-server
 */
export async function init(enabled: boolean, flowQueryParams: QueryParams) {
  setEnabled(enabled);

  if (!initialized) {
    // Initialize from the qs if we have the critical flow pieces
    if (
      flowQueryParams.deviceId &&
      flowQueryParams.flowBeginTime &&
      flowQueryParams.flowId
    ) {
      flowEventData = { ...flowQueryParams };
    } else {
      // Or initialize as a fresh flow
      const flowResponse = await fetch('/metrics-flow');
      flowEventData = await flowResponse.json();
      try {
        flowEventData.uniqueUserId = JSON.parse(
          localStorage.getItem('__fxa_storage.uniqueUserId')!
        );
      } catch (e) {}
    }

    // Make sure the default values are set. If default values are not set, metrics posts can fail.
    // There are situations where arriving directly to /beta/settings means query params won't be
    // provided, and we will use a set of fixed defaults.
    if (!flowEventData.uniqueUserId) {
      flowEventData.uniqueUserId = uuid();
      try {
        localStorage.setItem(
          '__fxa_storage.uniqueUserId',
          JSON.stringify(flowEventData.uniqueUserId)
        );
      } catch (e) {}
    }

    flowEventData.broker =
      configurableProperties.broker ||
      flowEventData.broker ||
      flowEventDataDefaults.broker;

    flowEventData.context =
      configurableProperties.context ||
      flowEventData.context ||
      flowEventDataDefaults.broker;

    flowEventData.service =
      configurableProperties.service ||
      flowEventData.service ||
      flowEventDataDefaults.service;

    flowEventData.isSampledUser =
      configurableProperties.isSampledUser ||
      flowEventData.isSampledUser ||
      flowEventDataDefaults.isSampledUser;

    flowEventData.deviceId =
      configurableProperties.deviceId ||
      flowEventData.deviceId ||
      flowEventDataDefaults.deviceId;

    initialized = true;
  }
}

/**
 * Initializes the user preference state for metrics.
 * @param accountData - An account data object containing user preferences applicable to metrics
 */
export function initUserPreferences(accountData: {
  recoveryKey: boolean;
  hasSecondaryVerifiedEmail: boolean;
  totpActive: boolean;
}) {
  setUserPreference('account-recovery', accountData.recoveryKey);
  setUserPreference('emails', accountData.hasSecondaryVerifiedEmail);
  setUserPreference('two-step-authentication', accountData.totpActive);
}

/**
 * Often we need to log a metric event in a place where hooks are not allowed.
 * However, we do want initialize some event data through the use of hooks.
 * It also provide a couple functions that ensure the event is logged once.
 */
export function useMetrics() {
  return {
    logViewEventOnce: logViewEventOnce,
    logPageViewEventOnce: logPageViewEventOnce,
  };
}

/**
 * Set the value of multiple configurable metrics event properties
 *
 * @param properties - Any ConfigurableProperties you wish to assign values to
 */
export function setProperties(properties: Hash<any>) {
  // Feature, but also protection: guard against setting a property
  // with a null value; defaults set in defaultConfigProps should
  // remain the "unset" value of a configurable property
  Object.keys(properties).forEach(
    (key) => properties[key] == null && delete properties[key]
  );
  configurableProperties = Object.assign(configurableProperties, properties);
}

/**
 * Set the view name prefix for metrics that contain a viewName.
 * This is used to differentiate between flows when the same
 * URL can appear in more than one place in the flow.
 *
 * This prefix is prepended to the view name anywhere a view
 * name is used.
 *
 * @param prefix
 */
export function setViewNamePrefix(prefix: string) {
  viewNamePrefix = prefix;
}

/**
 * Initialize a payload of metric event data to the metrics endpoint
 *
 * @param eventSlugs - Events to log; converted to proper event groups
 * @param eventProperties - Additional properties to log with the events
 */
export function logEvents(
  eventSlugs: string[] = [],
  eventProperties: Hash<any> = {}
) {
  try {
    const now = Date.now();
    // This is ok for now because there is no batching. But each event should
    // have its own offset.
    const eventOffset = Math.ceil(now - configurableProperties.startTime);
    const duration = Math.ceil(now - configurableProperties.startTime);
    // Amplitude events emitted from new Settings should have this property.
    eventProperties['settingsVersion'] = 'new';

    postMetrics(
      Object.assign(configurableProperties, {
        duration,
        events: eventSlugs.map((slug) => ({ type: slug, offset: eventOffset })),
        flushTime: now,
        referrer: window.document.referrer || NOT_REPORTED_VALUE,
        screen: getScreenInfo(),
        marketing: [],
        ...flowEventData,
        ...eventProperties,
      })
    );
  } catch (e) {
    console.error('AppError', e);
    captureException(e);
  }
}

/**
 * Logs an error event
 * @param error - An error object to log. Based loosely on AuthUiError state. This drives a unique the event identifier.
 * @param eventProperties - Extra event properties.
 */
export function logErrorEvent(
  error: {
    viewName?: string;
    errno?: number;
    context?: string;
    namespace?: string;
  },
  eventProperties: Hash<any> = {}
) {
  logEvents([errorToId()], eventProperties);

  function errorToId() {
    let context = error.context;
    if (!context) {
      if (error.viewName) {
        context = addViewNamePrefix(error.viewName);
      } else {
        context = 'unknown context';
      }
    }

    const id =
      'error.' +
      [context, error.namespace || 'unknown namespace', error.errno || -1].join(
        '.'
      );

    return id;
  }

  function addViewNamePrefix(viewName: string) {
    if (viewNamePrefix) {
      return `${viewNamePrefix}.${viewName}`;
    }
    return viewName;
  }
}

/**
 * Log an event with the view name as a prefix
 *
 * @param viewName
 * @param eventName
 * @param eventProperties - Additional properties to log with the event
 */
export function logViewEvent(
  viewName: string,
  eventName: string,
  eventProperties: Hash<any> = {}
) {
  if (viewNamePrefix) {
    viewName = `${viewNamePrefix}.${viewName}`;
  }

  logEvents([`${viewName}.${eventName}`], eventProperties);
}

/**
 * Same as logViewEvent, but ensures that event can be logged at most once per page lifecylce.
 * The event is memoized based on viewName and eventName.
 * @param viewName
 * @param eventName
 * @param eventProperties - Additional properties to log with the event
 */
export function logViewEventOnce(
  viewName: string,
  eventName: string,
  eventProperties: Hash<any> = {}
) {
  once(`${viewName}.${eventName}`, () => {
    logViewEvent(viewName, eventName, eventProperties);
  });
}

/**
 * React Hook to execute logViewEvent on component initial render
 *
 * @param viewName
 * @param eventName
 * @param eventProperties - Additional properties to log with the event
 * @param dependencies - values the effect depends on, changes to them will trigger a refire
 */
export function useViewEvent(
  viewName: string,
  eventName: string,
  eventProperties: Hash<any> = {}
) {
  useEffect(() => {
    logViewEventOnce(viewName, eventName, eventProperties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * A non-hook version of usePageViewEvent.  See comments for that function.
 */
export function logPageViewEvent(
  viewName: string,
  eventProperties: Hash<any> = {}
) {
  logEvents([`screen.${viewName}`], eventProperties);
}

/**
 * A non-hook version of usePageViewEvent.  Note that this function will log at most one
 * event per page lifecycle. The event is memoized based on viewName.
 */
export function logPageViewEventOnce(
  viewName: string,
  eventProperties: Hash<any> = {}
) {
  once(viewName, () => {
    logPageViewEvent(viewName, eventProperties);
  });
}

/**
 * A hook to emit a "view" event, e.g. "fxa_pref - view", for a, um, view.  It
 * is `useViewEvent` with the first argument pre-populated.  'screen' is a
 * legacy artifact in the content-server; let's capture that bit of weirdness
 * in this function.
 */
export function usePageViewEvent(
  viewName: string,
  eventProperties: Hash<any> = {}
) {
  useViewEvent('screen', viewName, eventProperties);
}

/**
 * Log when an experiment is shown to the user
 *
 * @param choice - Type of experiment
 * @param group - Experiment group (treatment or control)
 * @param eventProperties - Additional properties to log with the event
 */
export function logExperiment(
  choice: string,
  group: string,
  eventProperties: Hash<any> = {}
) {
  addExperiment(choice, group);
  logEvents([`experiment.${choice}.${group}`], eventProperties);
}

/**
 * Log when a user preference is updated. Example, two step
 * authentication, adding recovery email or account recovery key.
 *
 * @param prefName - Name of preference, typically view name
 */
export function setUserPreference(prefName: string, value: boolean) {
  configurableProperties.userPreferences[prefName] = value;
}

/**
 * Log subscribed newsletters for a user.
 *
 * @param newsletters
 */
export function setNewsletters(newsletters: string[]) {
  configurableProperties.newsletters = newsletters;
}

/**
 * Log participating experiment for a user.
 *
 * @param choice - Type of experiment
 * @param group - Experiment group (treatment or control)
 */
export function addExperiment(choice: string, group: string) {
  const index = configurableProperties.experiments.findIndex(
    (experiment) => experiment.choice === choice
  );
  const experiment: ExperimentGroup = { choice, group };

  if (~index) {
    configurableProperties.experiments[index] = experiment;
  } else {
    configurableProperties.experiments.push(experiment);
  }
}

/**
 * Take a record and pick out key-values for a MetricsContext.  Note that the
 * value passed in could've been asserted to be of QueryParam type with
 * specific keys but the value is actually a record of all the URL query params
 */
export function queryParamsToMetricsContext(
  queryParams: Record<string, string>
): MetricsContext {
  const metricsContext: MetricsContext = {};
  return MetricsContextKeys.reduce((acc, k) => {
    if (queryParams[k]) {
      // Special case for flowBeginTime, which is a number
      if (k === 'flowBeginTime') {
        acc[k] = Number(queryParams[k]);
      } else {
        acc[k] = queryParams[k] as any;
      }
    }
    return acc;
  }, metricsContext);
}
