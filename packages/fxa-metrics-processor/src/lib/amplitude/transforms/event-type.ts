/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PlainEvents, FuzzyEvents, Event, FuzzyEventGroup, OptionalString } from './types';

export function createEventTypeMapper(events: PlainEvents, fuzzyEvents: FuzzyEvents) {
  return (rawEventType: string): Event | null => {
    const mapping = events[rawEventType];

    if (mapping) {
      return { type: mapping.event, group: mapping.group };
    }

    let fuzzyEventGroupMapping: FuzzyEventGroup | null = null;
    let evtType: OptionalString;
    let evtGroup: OptionalString;
    let evtCategory: OptionalString = null;
    let evtTarget: OptionalString = null;

    for (const [regex, fuzzyEventGroup] of fuzzyEvents) {
      const match = regex.exec(rawEventType);

      if (match) {
        fuzzyEventGroupMapping = fuzzyEventGroup;

        if (match.length >= 2) {
          evtCategory = match[1];
          if (match.length === 3) {
            evtTarget = match[2];
          }
        }

        break;
      }
    }

    if (fuzzyEventGroupMapping) {
      evtType =
        typeof fuzzyEventGroupMapping.event === 'string'
          ? fuzzyEventGroupMapping.event
          : fuzzyEventGroupMapping.event(evtCategory, evtTarget);

      if (evtType === null) {
        return null;
      }

      evtGroup =
        typeof fuzzyEventGroupMapping.group === 'string'
          ? fuzzyEventGroupMapping.group
          : fuzzyEventGroupMapping.group(evtCategory);

      if (evtGroup === null) {
        return null;
      }

      return {
        type: evtType,
        group: evtGroup,
        category: evtCategory,
        target: evtTarget,
      };
    }

    return null;
  };
}

export function createAmplitudeEventType(evt: Event) {
  return `${evt.group} - ${evt.type}`;
}
