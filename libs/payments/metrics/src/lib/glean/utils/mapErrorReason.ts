/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ErrorReasons, type ErrorReason } from '../glean.types';

export function mapErrorReason(value?: string): ErrorReason {
  if (value && (ErrorReasons as readonly string[]).includes(value)) {
    return value as ErrorReason;
  }
  return 'general_error';
}
