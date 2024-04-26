/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AnySchema } from 'joi';

/**
 * A set of default message overrides. These result in better error resolution in sentry.
 */
export const defaultMessageOverrides = {
  // Override some of the message defaults. Here we remove the 'with value {:[.]}'
  // portion of the message, because it causes too much fragmentation in our sentry
  // errors. These should be applied to any .regex or .pattern joi validator.
  // Form more context concerning overriding messages see:
  //  - https://joi.dev/api/?v=17.6.0#anymessagesmessages
  //  - https://github.com/hapijs/joi/blob/7aa36666863c1dde7e4eb02a8058e00555a99d54/lib/types/string.js#L718
  'string.pattern.base':
    '{{#label}} fails to match the required pattern: {{#regex}}',
  'string.pattern.name': '{{#label}} fails to match the {{#name}} pattern',
  'string.pattern.invert.base':
    '{{#label}} matches the inverted pattern: {{#regex}}',
  'string.pattern.invert.name':
    '{{#label}} matches the inverted {{#name}} pattern',
};

/**
 * Applies a set of message overrides to the default joi message formats.
 * @param data - Set of joi validators to apply message overrides to to. Note, data is mutated.
 * @param overrides - Set of optional overrides, if none are provide the defaultMessageOverrides are used.
 * @returns data
 */
export function overrideJoiMessages(
  data: Record<string, AnySchema>,
  overrides?: Record<string, string>
) {
  Object.keys(data).forEach(
    (x) => (data[x] = data[x].messages(overrides || defaultMessageOverrides))
  );
  return data;
}
