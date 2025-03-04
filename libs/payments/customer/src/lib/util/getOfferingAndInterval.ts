/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubplatInterval } from '../types';
import { subplatIntervalToInterval } from '../constants';

export const getOfferingAndInterval = (
  interval: string,
  intervalCount: number
) => {
  for (const [key, value] of Object.entries(subplatIntervalToInterval)) {
    if (value.interval === interval && value.intervalCount === intervalCount) {
      return key as SubplatInterval;
    }
  }

  return undefined;
};
