/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PlainEvents, FuzzyEvents, RawEvent, EventContext, AmplitudeHttpEvent } from './types';
import { createEventTypeMapper, createAmplitudeEventType } from './event-type';
import { sha256Hmac, tee, mapLocation, prune, ServiceNameAndClientIdMapper } from './common';
import { getVersion } from './version';
import { mapOs, mapDeviceModel } from './user-agent';
import { parse } from '../../../../../fxa-shared/metrics/user-agent';
import { mapAmplitudeUserProperties } from './user-properties';
import { createAmplitudeEventPropertiesMapper } from './event-properties';

import Config from '../../../config';
const config = Config.getProperties();
const HMAC_KEY = config.amplitude.hmac_key;

export type AmplitudeEventTransformer = (
  rawEvent: RawEvent,
  context: EventContext
) => AmplitudeHttpEvent | null;

export function createAmplitudeEventTransformer(
  events: PlainEvents,
  fuzzyEvents: FuzzyEvents,
  servicePropsMapper: ServiceNameAndClientIdMapper
): AmplitudeEventTransformer {
  const eventTypeMapper = createEventTypeMapper(events, fuzzyEvents);
  const mapAmplitudeEventProperties = createAmplitudeEventPropertiesMapper(servicePropsMapper);

  /**
   * Create a request payload suitable for Amplitude's http/batch API.
   */
  return (rawEvent: RawEvent, evtContext: EventContext) => {
    const event = eventTypeMapper(rawEvent.type);

    // @TODO HMAC_KEY should've been checked before we get deep into here
    if (!event || !HMAC_KEY) {
      return null;
    }

    const context = prune(evtContext) as EventContext;

    const { time, device_id, session_id, language, user_id } = tee(rawEvent, context);

    let hashedUserId;
    if (user_id) {
      hashedUserId = sha256Hmac(HMAC_KEY, user_id);
    }

    // tslint:disable-next-line: variable-name
    const event_type = createAmplitudeEventType(event);
    // tslint:disable-next-line: variable-name
    const insert_id = sha256Hmac(HMAC_KEY, hashedUserId, device_id, session_id, event_type, time);

    const userAgent = parse(context.userAgent);

    return {
      insert_id,
      op: 'amplitudeEvent',
      event_type,
      time,
      user_id: hashedUserId,
      device_id,
      session_id,
      app_version: getVersion(context.version),
      language,
      ...mapLocation(context),
      ...mapOs(userAgent),
      ...mapDeviceModel(userAgent),
      event_properties: prune(mapAmplitudeEventProperties(event, context)),
      user_properties: prune(mapAmplitudeUserProperties(event, context, userAgent)),
    };
  };
}
