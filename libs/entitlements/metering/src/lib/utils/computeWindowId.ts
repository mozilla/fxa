/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { MeteringWindow } from '@fxa/shared/cms';

export function computeWindowId(
  window: MeteringWindow,
  windowStart: Date
): string | null {
  switch (window.kind) {
    case 'sliding':
      return null;
    case 'calendar':
      return `calendar:${window.period}:${windowStart.toISOString()}`;
    case 'session':
      return `session:${windowStart.toISOString()}`;
  }
}
