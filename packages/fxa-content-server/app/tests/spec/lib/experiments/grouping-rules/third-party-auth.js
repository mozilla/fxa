/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/third-party-auth';

describe('lib/experiments/grouping-rules/third-party-auth', () => {
  let experiment;
  const validClientID = 'dcdb5ae7add825d2';
  const invalidClientID = 'notvalid';

  beforeEach(() => {
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('returns false if no clientId', () => {
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          uniqueUserId: 'user-id',
        })
      );
    });

    it('returns false if invalid clientId', () => {
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          clientId: invalidClientID,
          uniqueUserId: 'user-id',
        })
      );
    });

    it('returns treatment if valid clientId', () => {
      const rules = experiment.groups;
      assert.isTrue(
        rules.include(
          experiment.choose({
            experimentGroupingRules: { choose: () => experiment.name },
            clientId: validClientID,
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
          clientId: validClientID,
          uniqueUserId: 'user-id',
        })
      );
    });
  });
});
