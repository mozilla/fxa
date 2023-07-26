/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';

import { accountsEvents } from './pings';
import { name } from './event';
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

let gleanEnabled = false;
let gleanMetricsContext;

const populateProperties = () => {
  const flowEventMetadata = gleanMetricsContext.metrics.getFlowEventMetadata();

  // TODO when sending metrics for authenticated accounts
  userIdSha256.set('');

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

const createEventFn = (eventName) => () => {
  if (!gleanEnabled) {
    return;
  }

  name.set(eventName);
  populateProperties();
  accountsEvents.submit();
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

  registration: {
    view: createEventFn('reg_view'),
    submit: createEventFn('reg_submit'),
    success: createEventFn('reg_submit_success'),
  },

  login: {
    view: createEventFn('login_view'),
    submit: createEventFn('login_submit'),
    success: createEventFn('login_submit_success'),
  },

  loginConfirmation: {
    view: createEventFn('login_email_confirmation_view'),
  },
};

export default GleanMetrics;
