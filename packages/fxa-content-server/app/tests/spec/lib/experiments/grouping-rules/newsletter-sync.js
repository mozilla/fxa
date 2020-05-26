/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/newsletter-sync';

describe('lib/experiments/grouping-rules/newsletter-sync', () => {
  let experiment;

  beforeEach(() => {
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('returns false if not Sync', () => {
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          isSync: false,
          uniqueUserId: 'user-id',
        })
      );
    });

    it('returns false if not `en` locale', () => {
      experiment.rolloutRate = 0;
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          isSync: true,
          lang: 'de',
          uniqueUserId: 'user-id',
        })
      );
    });

    it('returns false if rollout 0%', () => {
      experiment.rolloutRate = 0;
      assert.isFalse(
        experiment.choose({
          experimentGroupingRules: { choose: () => experiment.name },
          isSync: true,
          lang: 'en',
          uniqueUserId: 'user-id',
        })
      );
    });

    it('returns treatment if rollout 100%', () => {
      experiment.rolloutRate = 1;
      assert.isTrue(
        experiment.groups.includes(
          experiment.choose({
            experimentGroupingRules: { choose: () => experiment.name },
            isSync: true,
            lang: 'en',
            uniqueUserId: 'user-id',
          })
        )
      );
    });
  });
});
