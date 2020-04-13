/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { EventContext, Services, RawEvent } from './types';

type ServiceProperties = {
  serviceName: string | undefined;
  clientId: string | undefined;
};
export type ServiceNameAndClientIdMapper = (context: EventContext) => ServiceProperties;

export function createServiceNameAndClientIdMapper(services: Services) {
  return (context: EventContext): ServiceProperties => {
    let serviceName;
    let clientId;
    const { service } = context;
    if (service && service !== 'content-server') {
      if (service === 'sync') {
        serviceName = service;
      } else {
        serviceName = services[service] || 'undefined_oauth';
        clientId = service;
      }
    }

    return { serviceName, clientId };
  };
}

export type LocationProperties = {
  country: string;
  region: string;
};
export function mapLocation(context: EventContext): LocationProperties | {} {
  if (context.location) {
    const { location } = context;

    if (('country' in location && location.country) || ('state' in location && location.state)) {
      return {
        country: location?.country,
        region: location?.state
      };
    }
  }

  return {};
}

export function prune(xs: { [key: string]: any }): { [key: string]: {} } {
  return Object.keys(xs).reduce((acc: { [key: string]: {} }, k) => {
    if ((xs[k] && xs[k] !== 'none') || xs[k] === false) {
      acc[k] = xs[k];
    }
    return acc;
  }, {});
}

/**
 * 'tee' as in the CLI program.  A function for straight up copying values.
 */
export function tee(rawEvent: RawEvent, context: EventContext) {
  return {
    time: rawEvent.time,
    device_id: context.deviceId,
    session_id: context.flowBeginTime,
    language: context.lang,
    user_id: context.uid
  };
}

export function toSnakeCase(camelS: string) {
  return camelS
    .replace(/([a-z])([A-Z])/g, (s, c1, c2) => `${c1}_${c2.toLowerCase()}`)
    .replace(/([A-Z])/g, c => c.toLowerCase())
    .replace(/\./g, '_')
    .replace(/-/g, '_');
}

export function sha256Hmac(HMAC_KEY: string, ...properties: any[]) {
  const hmac = crypto.createHmac('sha256', HMAC_KEY);
  properties.forEach(property => {
    if (property) {
      hmac.update(`${property}`);
    }
  });

  return hmac.digest('hex');
}
