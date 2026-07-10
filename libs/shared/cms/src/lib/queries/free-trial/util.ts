/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import { FreeTrialResult } from './types';

  export class FreeTrialUtil {
    constructor(private rawResult: FreeTrialResult) {}

    getResult(): FreeTrialResult['freeTrials'] | undefined {
      const freeTrials = this.rawResult?.freeTrials ?? [];

      if (freeTrials.length === 0) return undefined;
      return freeTrials;
    }

    get freeTrial(): FreeTrialResult {
      return this.rawResult;
    }
  }
