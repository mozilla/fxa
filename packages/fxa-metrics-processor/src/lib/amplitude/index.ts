/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Services,
  PlainEvents,
  FuzzyEvents,
  RawEvent,
  EventContext,
  AmplitudeHttpEvent,
} from './transforms/types';
import { createServiceNameAndClientIdMapper } from './transforms/common';
import { createAmplitudeEventTransformer } from './transforms/amplitude-event';
import {
  createAmplitudeIdentityEvent,
  AmplitudeIdentifyEvent,
} from './transforms/amplitude-identify';

export type AmplitudeRequestPayloads = {
  http: AmplitudeHttpEvent;
  identify?: AmplitudeIdentifyEvent;
};

/**
 * Create a transform function from the given mappings.  A transform function
 * should be created per service (specifically for each of the "eventSource"
 * values in RawEvent).
 *
 * The transform function returns an object keyed by the Amplitude API for
 * which the value is intended.  There are two possible keys: "http" and
 * "identify".
 *
 * The "identify" property is optional.  However, if it does exist, then the
 * API request for it MUST be ahead of the request for the http API.
 *
 * @param services An object of client-id:service-name mappings
 * @param plainEvents  An object of name:definition event mappings, where
 *                     each definition value is itself an object with `group`
 *                     and `event` string properties.
 *
 * @param fuzzyEvents A map of regex:definition event mappings. Each regex
 *                    key may include up to two capturing groups. The first
 *                    group is used as the event "category" and the second is
 *                    used as the event "target". Again each definition value
 *                    is an object containing `group` and `event` properties
 *                    but here `group` can be a string or a function. If it's
 *                    a function, it will be passed the matched category
 *                    as its argument and should return the group string.
 */
export function createAmplitudePayloadsTransfromer(
  services: Services,
  plainEvents: PlainEvents,
  fuzzyEvent: FuzzyEvents
) {
  const servicePropsMapper = createServiceNameAndClientIdMapper(services);
  const amplitudeHttpEventTransformer = createAmplitudeEventTransformer(
    plainEvents,
    fuzzyEvent,
    servicePropsMapper
  );

  return (event: RawEvent, context: EventContext): AmplitudeRequestPayloads | null => {
    const httpApiPayload = amplitudeHttpEventTransformer(event, context);

    if (!httpApiPayload) {
      return null;
    }

    const payloads: AmplitudeRequestPayloads = {
      http: httpApiPayload,
    };

    const identifyApiPayload = createAmplitudeIdentityEvent(
      context,
      httpApiPayload,
      servicePropsMapper
    );

    if (identifyApiPayload) {
      payloads.identify = identifyApiPayload;
    }

    return payloads;
  };
}
