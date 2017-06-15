/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const { assert } = require('chai');
  const BaseExperiment = require('lib/experiments/grouping-rules/base');

  describe('lib/experiments/grouping-rules/base', () => {
    let experiment;

    const ITERATIONS = 1000;

    // Give a bit of leeway when making calculations since we
    // are using a relatively small sample set.
    const LEEWAY_PERCENTAGE = 5;

    const MAX_HASH_VALUE = Math.pow(2, 32);

    before(() => {
      experiment = new BaseExperiment();
    });

    describe('hash', () => {
      it('returns a 32 bit hash', () => {
        const hashes = new Array(ITERATIONS);
        for (var i = 0; i < ITERATIONS; ++i) {
          const hash = experiment.hash(Math.random());
          assert.ok(hash);
          assert.ok(0 <= hash && hash < MAX_HASH_VALUE);
          hashes[i] = hash;
        }

        // assure each hash value is unique.
        assert.lengthOf(_.uniq(hashes), ITERATIONS);
      });
    });

    describe('luckyNumber', () => {
      it('returns a number between 0 and 1', () => {
        const luckyNumbers = new Array(ITERATIONS);
        for (var i = 0; i < ITERATIONS; ++i) {
          const luckyNumber = experiment.luckyNumber(Math.random());
          assert.ok(0 <= luckyNumber && luckyNumber <= 1);
          luckyNumbers[i] = luckyNumber;
        }

        // assure each hash value is unique.
        assert.lengthOf(_.uniq(luckyNumbers), ITERATIONS);
      });
    });

    describe('bernoulliTrial', () => {
      it('returns false if percent is 0', () => {
        for (var i = 0; i < ITERATIONS; ++i) {
          assert.isFalse(experiment.bernoulliTrial(0, Math.random()));
        }
      });

      it('returns true if percent is 1', () => {
        for (var i = 0; i < ITERATIONS; ++i) {
          assert.isTrue(experiment.bernoulliTrial(1, Math.random()));
        }
      });

      it('returns roughly 50% true if percent is 0.5', () => {
        var trueCount = 0;
        for (var i = 0; i < ITERATIONS; ++i) {
          if (experiment.bernoulliTrial(0.50, Math.random())) {
            trueCount++;
          }
        }

        const leeway = Math.floor(ITERATIONS * (LEEWAY_PERCENTAGE / 100));
        const fiftyPercent = Math.round(ITERATIONS / 2);
        const min = fiftyPercent - leeway;
        const max = fiftyPercent + leeway;
        assert.ok(min <= trueCount && trueCount <= max, `${trueCount} is too far from ${fiftyPercent}`);
      });
    });

    describe('uniformChoice', () => {
      it('distributes members uniformly amongst grouping-rules', () => {
        const counts = {
          control: 0,
          treatment: 0
        };

        for (var i = 0; i < ITERATIONS; ++i) {
          const choice = experiment.uniformChoice(['control', 'treatment'], Math.random());
          counts[choice]++;
        }

        const leeway = Math.floor(ITERATIONS * (LEEWAY_PERCENTAGE / 100));
        const fiftyPercent = Math.round(ITERATIONS / 2);
        const min = fiftyPercent - leeway;
        const max = fiftyPercent + leeway;
        assert.ok(min <= counts.control && counts.control <= max, `${counts.control} is too far from ${fiftyPercent}`);
        assert.ok(min <= counts.treatment && counts.treatment <= max, `${counts.treatment} is too far from ${fiftyPercent}`);

        assert.equal(counts.control + counts.treatment, ITERATIONS);
      });
    });

    describe('choose', () => {
      it('must be overridden', () => {
        assert.throws(function () {
          experiment.choose();
        }, 'choose must be overridden');
      });
    });
  });
});
