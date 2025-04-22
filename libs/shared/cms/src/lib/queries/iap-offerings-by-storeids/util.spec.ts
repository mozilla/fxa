/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IapOfferingByStoreIDResultFactory } from './factories';
import { IapOfferingsByStoreIDsResultUtil } from './util';

describe('IapOfferingsByStoreIDsResultUtil', () => {
  describe('hasOverlap', () => {
    it('should return true when queried offeringId overlaps with any IAP offering', () => {
      const result = IapOfferingByStoreIDResultFactory();
      const overlappingOfferingId = result.iaps[0].offering.apiIdentifier;
      const util = new IapOfferingsByStoreIDsResultUtil(result);

      expect(util.hasOverlap(overlappingOfferingId)).toEqual(true);
    });

    it('should return true when queried offeringId overlaps with any IAP offering subgroup', () => {
      const result = IapOfferingByStoreIDResultFactory();
      const overlappingOfferingId =
        result.iaps[0].offering.subGroups[0].offerings[0].apiIdentifier;
      const util = new IapOfferingsByStoreIDsResultUtil(result);

      expect(util.hasOverlap(overlappingOfferingId)).toEqual(true);
    });

    it('should return false when queried offeringId does not overlap with any IAP', () => {
      const result = IapOfferingByStoreIDResultFactory();
      const util = new IapOfferingsByStoreIDsResultUtil(result);

      expect(util.hasOverlap('notfound')).toEqual(false);
    });
  });

  describe('offeringForStoreId', () => {
    it('should return the offering for the given storeId', () => {
      const result = IapOfferingByStoreIDResultFactory();
      const storeId = result.iaps[0].storeID;
      const util = new IapOfferingsByStoreIDsResultUtil(result);

      const offering = util.offeringForStoreId(storeId);

      expect(offering).toEqual({
        apiIdentifier: result.iaps[0].offering.apiIdentifier,
        interval: result.iaps[0].interval,
      });
    });

    it('should return undefined if the storeId does not exist', () => {
      const result = IapOfferingByStoreIDResultFactory();
      const util = new IapOfferingsByStoreIDsResultUtil(result);

      const offering = util.offeringForStoreId('notfound');

      expect(offering).toBeUndefined();
    });
  });
});
