/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const uuid = require('uuid');
const { assert } = require('chai');
import BaseExperiment from '../../experiments/base';

describe('experiments/base', () => {
  let experiment;

  const ITERATIONS = 1000;

  // Give a bit of leeway when making calculations since we
  // are using a relatively small sample set.
  const LEEWAY_PERCENTAGE = 8;

  const MAX_HASH_VALUE = Math.pow(2, 32);

  const leeway = Math.floor(ITERATIONS * (LEEWAY_PERCENTAGE / 100));
  const fiftyPercent = Math.round(ITERATIONS / 2);
  const min = fiftyPercent - leeway;
  const max = fiftyPercent + leeway;

  before(() => {
    experiment = new BaseExperiment();
  });

  // Fixed keys keep these tests deterministic. Random keys made the
  // distribution assertions flaky, see FXA-14281.
  const keys = Array.from({ length: ITERATIONS }, (_unused, i) => `key-${i}`);

  // Count how many of `values` fall into each of ten equally sized buckets
  // spanning [0, upperBound].
  const decileCounts = (values, upperBound) => {
    const counts = new Array(10).fill(0);
    values.forEach((value) => {
      counts[Math.min(9, Math.floor((value / upperBound) * 10))]++;
    });
    return counts;
  };

  describe('hash', () => {
    it('returns a 32 bit hash', () => {
      const hashes = keys.map((key) => experiment.hash(key));

      hashes.forEach((hash) => {
        assert.ok(0 <= hash && hash < MAX_HASH_VALUE);
      });
    });

    it('returns the same hash for the same key', () => {
      keys.forEach((key) => {
        assert.equal(experiment.hash(key), experiment.hash(key));
      });
    });

    it('spreads hashes across the 32 bit range', () => {
      const hashes = keys.map((key) => experiment.hash(key));

      decileCounts(hashes, MAX_HASH_VALUE).forEach((count, i) => {
        assert.ok(count > 0, `no hashes fell into decile ${i}`);
      });
    });
  });

  describe('luckyNumber', () => {
    it('returns a number between 0 and 1', () => {
      keys.forEach((key) => {
        const luckyNumber = experiment.luckyNumber(key);
        assert.ok(0 <= luckyNumber && luckyNumber <= 1);
      });
    });

    it('returns the same number for the same key', () => {
      keys.forEach((key) => {
        assert.equal(experiment.luckyNumber(key), experiment.luckyNumber(key));
      });
    });

    it('spreads numbers across [0,1]', () => {
      const luckyNumbers = keys.map((key) => experiment.luckyNumber(key));

      decileCounts(luckyNumbers, 1).forEach((count, i) => {
        assert.ok(count > 0, `no lucky numbers fell into decile ${i}`);
      });
    });
  });

  describe('bernoulliTrial', () => {
    it('returns false if percent is 0', () => {
      for (let i = 0; i < ITERATIONS; ++i) {
        assert.isFalse(experiment.bernoulliTrial(0, Math.random()));
      }
    });

    it('returns true if percent is 1', () => {
      for (let i = 0; i < ITERATIONS; ++i) {
        assert.isTrue(experiment.bernoulliTrial(1, Math.random()));
      }
    });

    it('returns roughly 50% true if percent is 0.5', () => {
      let trueCount = 0;
      for (let i = 0; i < ITERATIONS; ++i) {
        if (experiment.bernoulliTrial(0.5, Math.random())) {
          trueCount++;
        }
      }

      assert.ok(
        min <= trueCount && trueCount <= max,
        `${trueCount} is too far from ${fiftyPercent}`
      );
    });
  });

  describe('uniformChoice', () => {
    it('distributes members uniformly amongst grouping-rules', () => {
      const counts = {
        control: 0,
        treatment: 0,
      };

      for (let i = 0; i < ITERATIONS; ++i) {
        const choice = experiment.uniformChoice(
          ['control', 'treatment'],
          Math.random()
        );
        counts[choice]++;
      }

      assert.ok(
        min <= counts.control && counts.control <= max,
        `${counts.control} is too far from ${fiftyPercent}`
      );
      assert.ok(
        min <= counts.treatment && counts.treatment <= max,
        `${counts.treatment} is too far from ${fiftyPercent}`
      );

      assert.equal(counts.control + counts.treatment, ITERATIONS);
    });
  });

  describe('choose', () => {
    it('must be overridden', () => {
      assert.throws(function () {
        experiment.choose();
      }, 'choose must be overridden');
    });

    it('throws if deprecated', () => {
      assert.throws(() => {
        experiment.name = 'oldExperiment';
        experiment.deprecated = true;
        experiment.choose();
      }, 'Experiment deprecated: oldExperiment');
    });
  });

  describe('isTestEmail', () => {
    [
      'tester@mozilla.com',
      'testuser@mozilla.org',
      'tester@softvision.ro',
      'tester@softvision.com',
    ].forEach((email) => {
      it(`returns 'true' for test email: ${email}`, () => {
        assert.isTrue(experiment.isTestEmail(email));
      });
    });

    ['tester@google.com', 'tester@mozilla.es'].forEach((email) => {
      it(`returns false for other non-test email: ${email}`, () => {
        assert.isFalse(experiment.isTestEmail(email));
      });
    });
  });

  describe('one experiment choose another', () => {
    /**
     * See #5378. This test is to ensure the hashing function has a uniform distribution
     * when one experiment chooses another. We originally chose crc32 as the hashing
     * function. This worked fine when experiment.choose for two experiments were
     * called independently, but when one experiment was used to choose another,
     * *all* users of the chosen experiment were placed into the same bucket. md5
     * doesn't suffer from this problem.
     */
    class Experiment1 extends BaseExperiment {
      constructor() {
        super();
        this.name = 'experiment1';
      }

      choose(subject) {
        if (subject.experimentChooser.choose(subject) !== this.name) {
          return false;
        }

        const GROUPS = ['control', 'treatment'];
        return this.uniformChoice(GROUPS, subject.uuid);
      }
    }

    class Experiment2 extends BaseExperiment {
      constructor() {
        super();
        this.name = 'experiment2';
      }

      choose(subject) {
        if (subject.experimentChooser.choose(subject) !== this.name) {
          return false;
        }

        const GROUPS = ['control', 'treatment'];
        return this.uniformChoice(GROUPS, subject.uuid);
      }
    }

    class ExperimentChooser extends BaseExperiment {
      constructor() {
        super();
        this.name = 'chooserExperiment';
      }

      choose(subject) {
        const experiments = ['experiment1', 'experiment2'];
        return this.uniformChoice(experiments, subject.uuid);
      }
    }

    const checkExperimentDistribution = (name, experiment) => {
      it(`allocates ~ 1/2 to experiment, distributes uniformly amongst treatment/control groups. - ${name}`, () => {
        const counts = {
          control: 0,
          false: 0,
          treatment: 0,
        };

        const experimentChooser = new ExperimentChooser();

        for (let i = 0; i < ITERATIONS; ++i) {
          const choice = experiment.choose({
            experimentChooser,
            uuid: uuid.v4(),
          });

          counts[choice]++;
        }

        const fiftyPercentMin = fiftyPercent - leeway;
        const fiftyPercentMax = fiftyPercent + leeway;
        assert.ok(
          fiftyPercentMin <= counts.false && counts.false <= fiftyPercentMax,
          `${counts.false} is too far from ${fiftyPercent}`
        );

        const twentyFivePercent = Math.round(ITERATIONS / 4);
        const twentyFivePercentMin = twentyFivePercent - leeway;
        const twentyFivePercentMax = twentyFivePercent + leeway;
        assert.ok(
          twentyFivePercentMin <= counts.control &&
            counts.control <= twentyFivePercentMax,
          `${counts.control} is too far from ${twentyFivePercent}`
        );
        assert.ok(
          twentyFivePercentMin <= counts.treatment &&
            counts.treatment <= twentyFivePercentMax,
          `${counts.treatment} is too far from ${twentyFivePercent}`
        );

        assert.equal(
          counts.false + counts.control + counts.treatment,
          ITERATIONS
        );
      });
    };

    checkExperimentDistribution('Experiment1', new Experiment1());
    checkExperimentDistribution('Experiment2', new Experiment2());
  });
});
