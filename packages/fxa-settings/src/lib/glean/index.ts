/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import UAParser from 'ua-parser-js';
import { Entries } from 'type-fest';
import {
  GleanMetricsConfig,
  eventsMap,
  EventMapKeys,
  eventPropertyNames,
  EventsMap,
  GleanPingMetrics,
  PropertyNameT,
} from 'fxa-shared/metrics/glean/web/index';
import { accountsEvents } from 'fxa-shared/metrics/glean/web/pings';
import * as event from 'fxa-shared/metrics/glean/web/event';
import * as email from 'fxa-shared/metrics/glean/web/email';
import * as reg from 'fxa-shared/metrics/glean/web/reg';
import * as login from 'fxa-shared/metrics/glean/web/login';
import * as cachedLogin from 'fxa-shared/metrics/glean/web/cachedLogin';
import { userIdSha256 } from 'fxa-shared/metrics/glean/web/account';
import {
  oauthClientId,
  service,
} from 'fxa-shared/metrics/glean/web/relyingParty';
import {
  deviceType,
  entrypoint,
  flowId,
} from 'fxa-shared/metrics/glean/web/session';
import * as sync from 'fxa-shared/metrics/glean/web/sync';
import * as utm from 'fxa-shared/metrics/glean/web/utm';
import { FlowQueryParams } from '../..';
import { Integration } from '../../models';

type DeviceTypes = 'mobile' | 'tablet' | 'desktop';
export type GleanMetricsContext = {
  flowQueryParams: FlowQueryParams;
  account?: { uid?: hexstring; metricsEnabled?: boolean };
  userAgent: string;
  integration: Integration;
};
type PingFn = ReturnType<typeof createEventFn>;
type SubmitPingFn = () => Promise<void>;
type GleanMetricsT = {
  initialize: (
    config: GleanMetricsConfig,
    context: GleanMetricsContext
  ) => void;
  setEnabled: (enabled: boolean) => void;
  getEnabled: () => boolean;
  isDone: () => Promise<void>;
} & {
  [k in EventMapKeys]: { [eventKey in keyof EventsMap[k]]: PingFn };
};

let EXEC_MUTEX = false;
const lambdas: SubmitPingFn[] = [];

const submitPing = async (fn: SubmitPingFn) => {
  lambdas.push(fn);

  if (EXEC_MUTEX) return;

  EXEC_MUTEX = true;
  let f: SubmitPingFn | undefined;

  while ((f = lambdas.shift())) {
    await f();
  }

  EXEC_MUTEX = false;
};

let gleanEnabled = false;
let metricsContext: GleanMetricsContext;
let ua: UAParser | null;

const encoder = new TextEncoder();
const hashUid = async (uid: string) => {
  const data = encoder.encode(uid);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const uint8View = new Uint8Array(hash);
  const hex = uint8View.reduce(
    (str, byte) => str + ('00' + byte.toString(16)).slice(-2),
    ''
  );
  return hex;
};

const getDeviceType: () => DeviceTypes | void = () => {
  if (ua) {
    // This logic is from the old content server frontend
    const parsedType = ua.getDevice().type;
    switch (parsedType) {
      case 'mobile':
      case 'tablet':
        return parsedType;
      case 'smarttv':
      case 'wearable':
      case 'embedded':
        return 'mobile';
      default:
        return 'desktop';
    }
  }

  if (metricsContext?.userAgent) {
    ua = new UAParser(metricsContext.userAgent);
    return getDeviceType();
  }
};

const populateMetrics = async (gleanPingMetrics: GleanPingMetrics) => {
  if (gleanPingMetrics?.event) {
    // The event here is the Glean `event` metric type, not an "metrics event" in
    // a more general sense
    for (const n of eventPropertyNames as PropertyNameT) {
      event[n].set(gleanPingMetrics.event[n] || '');
    }
  }

  if (gleanPingMetrics?.sync?.cwts) {
    Object.entries(gleanPingMetrics.sync.cwts).forEach(([k, v]) => {
      sync.cwts[k].set(v);
    });
  }

  userIdSha256.set('');
  try {
    if (metricsContext.account?.uid) {
      const hashedUid = await hashUid(metricsContext.account.uid);
      userIdSha256.set(hashedUid);
    }
  } catch (e) {
    // noop
  }

  oauthClientId.set(metricsContext.integration.data.clientId || '');
  service.set(metricsContext.integration.data.service || '');

  deviceType.set(getDeviceType() || '');
  entrypoint.set(metricsContext.integration.data.entrypoint || '');
  flowId.set(metricsContext.flowQueryParams.flowId || '');

  utm.campaign.set(metricsContext.integration.data.utmCampaign || '');
  utm.content.set(metricsContext.integration.data.utmContent || '');
  utm.medium.set(metricsContext.integration.data.utmMedium || '');
  utm.source.set(metricsContext.integration.data.utmSource || '');
  utm.term.set(metricsContext.integration.data.utmTerm || '');
};

const recordEventMetric = (eventName: string) => {
  switch (eventName) {
    case 'email_first_view':
      email.firstView.record();
      break;
    case 'reg_view':
      reg.view.record();
      break;
    case 'reg_engage':
      reg.engage.record();
      break;
    case 'reg_submit':
      reg.submit.record();
      break;
    case 'reg_submit_success':
      reg.submitSuccess.record();
      break;
    case 'reg_signup_code_view':
      reg.signupCodeView.record();
      break;
    case 'reg_signup_code_submit':
      reg.signupCodeSubmit.record();
      break;
    case 'login_view':
      login.view.record();
      break;
    case 'login_submit':
      login.submit.record();
      break;
    case 'login_submit_success':
      login.submitSuccess.record();
      break;
    case 'login_submit_frontend_error':
      login.submitFrontendError.record();
      break;
    case 'cached_login_view':
      cachedLogin.view.record();
      break;
    case 'cached_login_submit':
      cachedLogin.submit.record();
      break;
    case 'cached_login_success_view':
      cachedLogin.successView.record();
      break;
    case 'login_email_confirmation_view':
      login.emailConfirmationView.record();
      break;
    case 'login_email_confirmation_submit':
      login.emailConfirmationSubmit.record();
      break;
    case 'login_totp_form_view':
      login.totpFormView.record();
      break;
    case 'login_totp_code_submit':
      login.totpCodeSubmit.record();
      break;
    case 'login_totp_code_success_view':
      login.totpCodeSuccessView.record();
      break;
  }
};

const createEventFn =
  (eventName: string) =>
  (gleanPingMetrics: GleanPingMetrics = {}) => {
    if (!gleanEnabled) {
      return;
    }

    const fn = async () => {
      event.name.set(eventName);
      await populateMetrics(gleanPingMetrics);

      // recording the event metric triggers the event ping because Glean is initialized with `maxEvents: 1`
      recordEventMetric(eventName);

      accountsEvents.submit();
    };

    submitPing(fn);
  };

export const GleanMetrics: Pick<
  GleanMetricsT,
  'initialize' | 'setEnabled' | 'getEnabled' | 'isDone'
> = {
  initialize: (config: GleanMetricsConfig, context: GleanMetricsContext) => {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1859629
    // Starting with glean.js v2, accessing localStorage during
    // initialization could cause an error
    try {
      if (config.enabled) {
        Glean.initialize(config.applicationId, config.uploadEnabled, {
          appDisplayVersion: config.appDisplayVersion,
          channel: config.channel,
          serverEndpoint: config.serverEndpoint,
        });
        Glean.setLogPings(config.logPings);
        if (config.debugViewTag) {
          Glean.setDebugViewTag(config.debugViewTag);
        }
      }
      GleanMetrics.setEnabled(config.enabled);
      metricsContext = context;
      ua = null;
    } catch (_) {
      // set some states so we won't try to do anything with glean.js later
      config.enabled = false;
      gleanEnabled = false;
    }
  },

  setEnabled: (enabled: boolean) => {
    gleanEnabled = enabled;
    Glean.setUploadEnabled(gleanEnabled);
  },

  getEnabled: () => {
    return gleanEnabled;
  },

  /**
   * The ping calls are awaited internally for ease of use and that works in
   * most cases.  But in the scenario where we want to wait for the pings to
   * finish before we unload the page, we are doing so, crudely, here.  Do not
   * emit more pings after calling this function.
   */
  isDone: () =>
    new Promise((resolve) => {
      const checkForEmptyFnList = () => {
        if (lambdas.length === 0) {
          resolve();
        } else {
          setTimeout(checkForEmptyFnList, 100);
        }
      };

      checkForEmptyFnList();
    }),
};

for (const [page, events] of Object.entries(eventsMap) as Entries<EventsMap>) {
  (GleanMetrics as any)[page] = Object.entries(events).reduce(
    (acc: { [key: string]: PingFn }, [evt, name]) => {
      acc[evt] = createEventFn(name);
      return acc;
    },
    {}
  );
}

export default GleanMetrics as GleanMetricsT;
