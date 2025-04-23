/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  type IapOfferingByStoreIDResult,
  type IapWithOfferingResult,
} from './types';

export class IapOfferingsByStoreIDsResultUtil {
  private iaps: IapWithOfferingResult[];

  constructor(rawResult: IapOfferingByStoreIDResult) {
    this.iaps = rawResult.iaps;
  }

  offeringForStoreId(storeId: string):
    | {
        apiIdentifier: string;
        interval: string;
      }
    | undefined {
    const offeringResult = this.iaps.find((iap) => {
      return iap.storeID === storeId;
    });
    if (!offeringResult) {
      return undefined;
    }

    return {
      apiIdentifier: offeringResult.offering.apiIdentifier,
      interval: offeringResult.interval,
    };
  }

  hasOverlap(offeringId: string): boolean {
    for (const iap of this.iaps) {
      if (iap.offering.apiIdentifier === offeringId) {
        return true;
      }
      for (const subGroup of iap.offering.subGroups) {
        for (const offering of subGroup.offerings) {
          if (offering.apiIdentifier === offeringId) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
