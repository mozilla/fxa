/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import Experiment from 'lib/experiments/grouping-rules/cwts-on-signup-password';

describe('lib/experiments/grouping-rules/cwts-on-signup-password', () => {
  let experiment;

  beforeEach(() => {
    experiment = new Experiment();
  });

  describe('_isValidSubject', () => {
    it('subject must contain all expected fields', () => {
      assert.isTrue(
        experiment._isValidSubject({
          email: 'baz',
          multiService: true,
          service: 'bar',
          uniqueUserId: 'foo',
        })
      );
      assert.isFalse(experiment._isValidSubject());
      assert.isFalse(
        experiment._isValidSubject({
          service: 'bar',
          multiService: true,
          uniqueUserId: 'foo',
        })
      );
      assert.isFalse(
        experiment._isValidSubject({
          email: 'baz',
          multiService: true,
          uniqueUserId: 'foo',
        })
      );
      assert.isFalse(
        experiment._isValidSubject({
          email: 'baz',
          multiService: true,
          service: 'bar',
        })
      );
      assert.isFalse(
        experiment._isValidSubject({
          email: 'baz',
          service: 'bar',
          uniqueUserId: 'foo',
        })
      );
    });
  });

  describe('choose', () => {
    it('returns false if invalid subject', () => {
      assert.isFalse(experiment.choose({}));
    });

    it('returns `treatment` if service === sync', () => {
      assert.equal(
        experiment.choose({
          email: 'foo',
          multiService: false,
          service: 'sync',
          uniqueUserId: 'baz',
        }),
        'treatment'
      );
    });

    it('returns false if service !== sync and multiService === false', () => {
      assert.isFalse(
        experiment.choose({
          email: 'foo',
          multiService: false,
          service: 'bar',
          uniqueUserId: 'baz',
        })
      );
    });

    it('returns false if rollout rate is 0', () => {
      assert.isFalse(
        experiment.choose({
          email: 'foo',
          multiService: true,
          rolloutRate: 0,
          service: 'bar',
          uniqueUserId: 'baz',
        })
      );
    });

    it('returns treatment if rollout  rate is 1', () => {
      assert.equal(
        experiment.choose({
          email: 'foo',
          multiService: true,
          rolloutRate: 1,
          service: 'bar',
          uniqueUserId: 'baz',
        }),
        'treatment'
      );
    });

    it('returns treatment if using test email', () => {
      assert.equal(
        experiment.choose({
          email: 'testuser@mozilla.com',
          multiService: true,
          rolloutRate: 0.2,
          service: 'bar',
          uniqueUserId: 'baz',
        }),
        'treatment'
      );
    });

    it('returns treatment for specially crafted email', () => {
      assert.equal(
        experiment.choose({
          email: 'signupPasswordCWTS.treatment1234513125@restmail.net',
          multiService: true,
          rolloutRate: 0.2,
          service: 'bar',
          uniqueUserId: 'baz',
        }),
        'treatment'
      );
    });

    it('returns control for specially crafted email', () => {
      assert.equal(
        experiment.choose({
          email: 'signupPasswordCWTS.control@restmail.net',
          multiService: true,
          rolloutRate: 0.2,
          service: 'bar',
          uniqueUserId: 'baz',
        }),
        'control'
      );
    });

    it('returns selected group if part of trial', () => {
      sinon.stub(experiment, 'bernoulliTrial').callsFake(() => true);
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'quix');

      assert.equal(
        experiment.choose({
          email: 'foo',
          multiService: true,
          rolloutRate: 0.2,
          service: 'bar',
          uniqueUserId: 'baz',
        }),
        'quix'
      );
    });

    it('returns false otw', () => {
      sinon.stub(experiment, 'bernoulliTrial').callsFake(() => false);

      assert.isFalse(
        experiment.choose({
          email: 'foo',
          multiService: true,
          rolloutRate: 0.2,
          service: 'bar',
          uniqueUserId: 'baz',
        })
      );
    });
  });
});
