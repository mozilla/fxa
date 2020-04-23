/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AmplitudeHttpEvent, EventContext } from './types';
import { ServiceNameAndClientIdMapper, toSnakeCase } from './common';

// See https://developers.amplitude.com/?javascript#identify-api

// Event though we include all these verbs here, only $append is used in practice.
const IDENTIFY_VERBS = ['$set', '$setOnce', '$add', '$append', '$prepend', '$unset'] as const;
type IdentifyVerb = typeof IDENTIFY_VERBS[number];
export type AmplitudeIdentifyEvent = {
  device_id?: AmplitudeHttpEvent['device_id'];
  event_type: '$identify';
  user_id: AmplitudeHttpEvent['user_id'];
  user_properties: IdentifyEventUserProperties;
};
type IdentifyEventUserProperties = {
  [key in Exclude<IdentifyVerb, '$append'>]?: { [key: string]: {} };
} & {
  $append?: AppendUserProperties;
};
type AppendUserProperties = {
  [key: string]: string | string[];
};

/**
 * Create the payload for an Amplitude "identify" event.  Currently this _only_
 * uses `$append` because historically that's what FxA services did.
 *
 * @param context Raw event context
 * @param amplitudeEventHttpEvent The Amplitude http/batch API payload
 *                                associated with the identify event
 * @param servicePropMapper A function for mapping service names and client ids
 */
export function createAmplitudeIdentityEvent(
  context: EventContext,
  amplitudeEventHttpEvent: AmplitudeHttpEvent,
  servicePropMapper: ServiceNameAndClientIdMapper
): AmplitudeIdentifyEvent | null {
  const servicesUsed = mapServicesUsed(servicePropMapper, context);
  const experiments = mapExperiments(context);
  const userPreferences = mapUserPreferences(context);

  if (servicesUsed || experiments || userPreferences) {
    return {
      device_id: amplitudeEventHttpEvent.device_id,
      event_type: '$identify',
      user_id: amplitudeEventHttpEvent.user_id,
      user_properties: {
        $append: {
          ...servicesUsed,
          ...experiments,
          ...userPreferences,
        },
      },
    };
  }

  return null;
}

function mapServicesUsed(servicePropMapper: ServiceNameAndClientIdMapper, context: EventContext) {
  const { serviceName } = servicePropMapper(context);

  if (serviceName) {
    return {
      fxa_services_used: serviceName,
    };
  }

  return null;
}

function mapExperiments(context: EventContext) {
  const { experiments } = context;

  if (Array.isArray(experiments) && experiments.length > 0) {
    return {
      experiments: experiments.map((e) => `${toSnakeCase(e.choice)}_${toSnakeCase(e.group)}`),
    };
  }

  return null;
}

function mapUserPreferences(context: EventContext) {
  const { userPreferences } = context;

  // Don't send user preferences metric if there are none!
  if (!userPreferences || Object.keys(userPreferences).length === 0) {
    return null;
  }

  return Object.keys(userPreferences).reduce((prefs: { [key: string]: string }, k) => {
    prefs[toSnakeCase(k)] = userPreferences[k];
    return prefs;
  }, {});
}
