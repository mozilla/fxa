/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sentryMetrics from 'fxa-shared/lib/sentry';
import { useEffect } from 'react';

const NOT_REPORTED_VALUE = 'none';
const UNKNOWN_VALUE = 'unknown';

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

type MarketingCampaign = {
  campaignId: string;
  clicked: boolean;
  url: string;
};

type UserPreferences = {
  [userPref: string]: boolean;
};

type ConfigurableProperties = {
  experiments: ExperimentGroup[];
  lang: string | typeof UNKNOWN_VALUE;
  marketing: MarketingCampaign[];
  newsletters: string[];
  startTime: number;
  uid: Optional<string>;
  userPreferences: UserPreferences;
  utm_campaign: Optional<string>;
  utm_content: Optional<string>;
  utm_medium: Optional<string>;
  utm_source: Optional<string>;
  utm_term: Optional<string>;
};

type EventData = FlowQueryParams &
  ConfigurableProperties & {
    duration: number;
    events: EventSet[];
    flushTime: number;
    referrer: string;
    screen: ScreenInfo;
    [additionalProperty: string]: any;
  };

let initialized = false;
let viewNamePrefix: string | null;
let flowEventData: FlowQueryParams;
let configurableProperties: ConfigurableProperties = defaultConfigProps();

function defaultConfigProps(): ConfigurableProperties {
  return {
    experiments: [],
    lang: UNKNOWN_VALUE,
    marketing: [],
    newsletters: [],
    // TODO: performance.timing.navigationStart should work, but doesn't
    startTime: 123,
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
  if (!initialized || !window.navigator.sendBeacon) {
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
export function init(flowQueryParams: FlowQueryParams) {
  if (!initialized) {
    // Only initialize if we have the critical flow pieces
    if (
      flowQueryParams.deviceId &&
      flowQueryParams.flowBeginTime &&
      flowQueryParams.flowId
    ) {
      flowEventData = flowQueryParams;
      initialized = true;
    } else {
      let redirectPath = window.location.pathname;
      if (window.location.search) {
        redirectPath += window.location.search;
      }

      return window.location.replace(
        `${window.location.origin}/get_flow?redirect_to=${encodeURIComponent(
          redirectPath
        )}`
      );
    }
  }
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
 * URL can appear in more than one place in the flow, e.g., the
 * /sms screen. The /sms screen can be displayed in either the
 * signup or verification tab, and we want to be able to
 * differentiate between the two.
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
    const eventOffset = now - flowEventData.flowBeginTime!;

    postMetrics(
      Object.assign(configurableProperties, {
        duration: 0, // TODO where is this set?
        events: eventSlugs.map((slug) => ({ type: slug, offset: eventOffset })),
        flushTime: now,
        referrer: window.document.referrer || NOT_REPORTED_VALUE,
        screen: getScreenInfo(),
        ...flowEventData,
        ...eventProperties,
      })
    );
  } catch (e) {
    console.error('AppError', e);
    sentryMetrics.captureException(e);
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
  eventProperties: Hash<any> = {},
  dependencies: any[] = []
) {
  useEffect(() => {
    logViewEvent(viewName, eventName, eventProperties);
  }, dependencies);
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
 * authentication, adding recovery email or recovery key.
 *
 * @param prefName - Name of preference, typically view name
 */
export function setUserPreference(prefName: string, value: boolean) {
  configurableProperties.userPreferences = { [prefName]: value };
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
 * Log when a marketing snippet is shown to the user
 *
 * @param url - URL of marketing link
 * @param campaignId - Marketing campaign id
 */
export function addMarketingImpression(url: string, campaignId?: string) {
  const impression: MarketingCampaign = {
    campaignId: campaignId || UNKNOWN_VALUE,
    url,
    clicked: false,
  };

  configurableProperties.marketing.push(impression);
}

/**
 * Log whether the user clicked on a marketing link
 *
 * @param url - URL of marketing link
 * @param campaignId - Marketing campaign id
 */
export function setMarketingClick(url: string, campaignId: string) {
  const index = configurableProperties.marketing.findIndex(
    (impression) =>
      impression.url === url && impression.campaignId === campaignId
  );

  if (index < 0) {
    return;
  }

  configurableProperties.marketing[index].clicked = true;
}
