/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment, {
  POCKET_CLIENTIDS,
} from 'lib/experiments/grouping-rules/pocket-migration';

describe('lib/experiments/grouping-rules/pocket-migration', () => {
  let experiment;

  beforeEach(() => {
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('returns false if invalid client id', () => {
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          clientId: 'foo',
        })
      );
    });

    it('returns false if rollout 0%', () => {
      experiment.rolloutRate = 0;
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          clientId: POCKET_CLIENTIDS[0],
        })
      );
    });

    it('returns treatment if rollout 100%', () => {
      experiment.rolloutRate = 1;
      assert.isTrue(
        experiment.groups.includes(
          experiment.choose({
            experimentGroupingRules: { choose: () => experiment.name },
            clientId: POCKET_CLIENTIDS[0],
          })
        )
      );
    });
  });
});
