/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/new-recovery-key-UI';

describe('lib/experiments/grouping-rules/new-recovery-key-UI', () => {
  let experiment;

  beforeEach(() => {
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('returns treatment if valid clientId', () => {
      const rules = experiment.groups;
      assert.isTrue(
        rules.include(
          experiment.choose({
            experimentGroupingRules: { choose: () => experiment.name },
            uniqueUserId: 'user-id',
          })
        )
      );
    });

    it('returns false if rollout 0%', () => {
      experiment.rolloutRate = 0;
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          uniqueUserId: 'user-id',
        })
      );
    });
  });
});
