/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FreeTrialResultFactory, FreeTrialFactory } from './factories';
import { FreeTrialUtil } from './util';

describe('FreeTrialUtil', () => {
  it('should create a util from response', () => {
    const result = FreeTrialResultFactory();
    const util = new FreeTrialUtil(result);
    expect(util).toBeDefined();
    expect(util.freeTrial.freeTrials).toHaveLength(1);
  });

  describe('getResult', () => {
    it('should return free trials', () => {
      const result = FreeTrialResultFactory();
      const util = new FreeTrialUtil(result);
      const trials = util.getResult();
      expect(trials).toBeDefined();
      expect(trials).toHaveLength(1);
    });

    it('should return undefined when no free trials', () => {
      const result = FreeTrialResultFactory({ freeTrials: [] });
      const util = new FreeTrialUtil(result);
      expect(util.getResult()).toBeUndefined();
    });

    it('should return multiple free trials', () => {
      const result = FreeTrialResultFactory({
        freeTrials: [FreeTrialFactory(), FreeTrialFactory()],
      });
      const util = new FreeTrialUtil(result);
      const trials = util.getResult();
      expect(trials).toHaveLength(2);
    });
  });
});
