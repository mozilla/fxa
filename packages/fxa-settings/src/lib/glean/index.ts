/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import UAParser from 'ua-parser-js';
import {
  GleanMetricsConfig,
  eventsMap,
  EventMapKeys,
  EventProperties,
  eventPropertyNames,
} from 'fxa-shared/metrics/glean/web/index';
import { accountsEvents } from 'fxa-shared/metrics/glean/web/pings';
import * as event from 'fxa-shared/metrics/glean/web/event';
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
import * as utm from 'fxa-shared/metrics/glean/web/utm';
import { useAccount } from '../../models/hooks';
import { FlowQueryParams } from '../..';
import { Integration } from '../../models';

type DeviceTypes = 'mobile' | 'tablet' | 'desktop';
export type GleanMetricsContext = {
  flowQueryParams: FlowQueryParams;
  account?: ReturnType<typeof useAccount>;
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
} & {
  [k in EventMapKeys]: { [k: string]: PingFn };
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

const populateMetrics = async (properties: EventProperties) => {
  for (const n of eventPropertyNames) {
    event[n].set(properties[n] || '');
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

const createEventFn =
  (eventName: string) =>
  (properties: EventProperties = {}) => {
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

export const GleanMetrics: Pick<GleanMetricsT, 'initialize' | 'setEnabled'> = {
  initialize: (config: GleanMetricsConfig, context: GleanMetricsContext) => {
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
  },

  setEnabled: (enabled: boolean) => {
    gleanEnabled = enabled;
    Glean.setUploadEnabled(gleanEnabled);
  },
};

for (const [page, events] of Object.entries(eventsMap)) {
  (GleanMetrics as GleanMetricsT)[page as EventMapKeys] = Object.entries(
    events
  ).reduce((acc: { [key: string]: PingFn }, [evt, name]) => {
    acc[evt] = createEventFn(name);
    return acc;
  }, {});
}

export default GleanMetrics as GleanMetricsT;
