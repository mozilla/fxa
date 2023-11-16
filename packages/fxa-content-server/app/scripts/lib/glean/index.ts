/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';

import { accountsEvents } from './pings';
import * as event from './event';
import { userIdSha256 } from './account';
import { oauthClientId, service } from './relyingParty';
import { deviceType, entrypoint, flowId } from './session';
import * as utm from './utm';

export type GleanMetricsConfig = {
  enabled: boolean;
  applicationId: string;
  uploadEnabled: boolean;
  appDisplayVersion: string;
  channel: string;
  serverEndpoint: string;
  logPings: boolean;
  debugViewTag: string;
};

export type GleanMetricsContext = {
  metrics: any;
  relier: any;
  user: any;
  userAgent: any;
};

type SubmitPingFn = () => Promise<void>;

const eventPropertyNames = ['reason'] as const;
type PropertyNameT = typeof eventPropertyNames;
type PropertyName = PropertyNameT[number];
type EventProperties = {
  [k in PropertyName]?: string;
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

const encoder = new TextEncoder();

let gleanEnabled = false;
let gleanMetricsContext;

const hashUid = async (uid) => {
  const data = encoder.encode(uid);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const uint8View = new Uint8Array(hash);
  const hex = uint8View.reduce(
    (str, byte) => str + ('00' + byte.toString(16)).slice(-2),
    ''
  );
  return hex;
};

const populateMetrics = async (properties: EventProperties = {}) => {
  const account = gleanMetricsContext.user.getSignedInAccount();

  // the "signed in" account could just be the most recently used account from
  // local storage; the user might not have proved that they know the password
  // of the account
  if (account.get('sessionToken')) {
    const hashedUid = await hashUid(account.get('uid'));
    userIdSha256.set(hashedUid);
  } else {
    userIdSha256.set('');
  }

  for (const n of eventPropertyNames) {
    event[n].set(properties[n] || '');
  }

  const flowEventMetadata = gleanMetricsContext.metrics.getFlowEventMetadata();

  oauthClientId.set(gleanMetricsContext.relier.get('clientId') || '');
  service.set(gleanMetricsContext.relier.get('service') || '');

  deviceType.set(gleanMetricsContext.userAgent.genericDeviceType() || '');
  entrypoint.set(flowEventMetadata.entrypoint || '');
  flowId.set(flowEventMetadata.flowId || '');

  utm.campaign.set(flowEventMetadata.utmCampaign || '');
  utm.content.set(flowEventMetadata.utmContent || '');
  utm.medium.set(flowEventMetadata.utmMedium || '');
  utm.source.set(flowEventMetadata.utmSource || '');
  utm.term.set(flowEventMetadata.utmTerm || '');
};

const createEventFn =
  (eventName) =>
  async (properties: EventProperties = {}) => {
    if (!gleanEnabled) {
      return;
    }

    const fn = async () => {
      event.name.set(eventName);
      await populateMetrics(properties);
      accountsEvents.submit();
    };

    submitPing(fn);
  };

export const GleanMetrics = {
  initialize: (config: GleanMetricsConfig, context: GleanMetricsContext) => {
    if (config.enabled) {
      Glean.initialize(config.applicationId, config.uploadEnabled, {
        appDisplayVersion: config.appDisplayVersion,
        channel: config.channel,
        serverEndpoint: config.serverEndpoint,
        // Glean does not offer direct control over when metrics are uploaded;
        // this ensures that events are uploaded.
        maxEvents: 1,
      });
      Glean.setLogPings(config.logPings);
      if (config.debugViewTag) {
        Glean.setDebugViewTag(config.debugViewTag);
      }

      gleanMetricsContext = context;
    }
    GleanMetrics.setEnabled(config.enabled);
  },

  setEnabled: (enabled) => {
    gleanEnabled = enabled;
    Glean.setUploadEnabled(gleanEnabled);
  },

  emailFirst: {
    view: createEventFn('email_first_view'),
  },

  registration: {
    view: createEventFn('reg_view'),
    submit: createEventFn('reg_submit'),
    success: createEventFn('reg_submit_success'),
  },

  signupConfirmation: {
    view: createEventFn('reg_signup_code_view'),
    submit: createEventFn('reg_signup_code_submit'),
  },

  login: {
    view: createEventFn('login_view'),
    submit: createEventFn('login_submit'),
    success: createEventFn('login_submit_success'),
    error: createEventFn('login_submit_frontend_error'),
  },

  loginConfirmation: {
    view: createEventFn('login_email_confirmation_view'),
    submit: createEventFn('login_email_confirmation_submit'),
  },

  totpForm: {
    view: createEventFn('login_totp_form_view'),
    submit: createEventFn('login_totp_code_submit'),
    success: createEventFn('login_totp_code_success_view'),
  },
};

export default GleanMetrics;
