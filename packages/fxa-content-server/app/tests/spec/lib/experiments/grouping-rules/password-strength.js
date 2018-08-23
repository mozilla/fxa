/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Account = require('models/account');
const Experiment = require('lib/experiments/grouping-rules/password-strength');
const sinon = require('sinon');

describe('lib/experiments/grouping-rules/password-strength', () => {
  describe('choose', () => {
    let account;
    let experiment;
    let subject;

    beforeEach(() => {
      account = new Account();
      experiment = new Experiment();
      subject = {
        account: account,
        experimentGroupingRules: {},
        lang: 'en',
        uniqueUserId: 'user-id'
      };
    });

    it('has the expected locales fully rolled out', () => {
      assert.include(experiment.FULLY_ROLLED_OUT, 'en');
    });

    it('has the expected rollout rates defined', () => {
      assert.equal(experiment.ROLLOUT_RATES.de, 0.2);
    });

    ['a@mozilla.org', 'a@softvision.com', 'a@softvision.ro', 'a@softvision.com'].forEach((email) => {
      it(`returns 'designF' experiment for ${email} email`, () => {
        subject.account.set('email', email);
        assert.equal(experiment.choose(subject), 'designF');
      });
    });

    it('returns designF if fully rolled out, delegates to uniformChoice if partially rolled out', () => {
      experiment.FULLY_ROLLED_OUT = ['en'];
      experiment.ROLLOUT_RATES = {
        de: 1.0
      };
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');

      assert.equal(experiment.choose(subject), 'designF');
      assert.isFalse(experiment.uniformChoice.called);

      subject.lang = 'de';
      assert.equal(experiment.choose(subject), 'control');
      assert.isTrue(experiment.uniformChoice.calledOnceWith(['control', 'designF']));
    });

    it('delegates to uniformChoice if in rollout using extended lang', () => {
      experiment.FULLY_ROLLED_OUT = [];
      experiment.ROLLOUT_RATES = {
        de: 1.0,
        en: 1.0
      };
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');

      experiment.choose(Object.assign({}, subject, { lang: 'en-GB' }));
      assert.isTrue(experiment.uniformChoice.calledOnceWith(['control', 'designF']));

      experiment.choose(Object.assign({}, subject, { lang: 'de-AT' }));
      assert.isTrue(experiment.uniformChoice.calledTwice);
      assert.deepEqual(experiment.uniformChoice.args[1][0], [ 'control', 'designF' ]);
    });

    it('returns false if not in rollout', () => {
      experiment.FULLY_ROLLED_OUT = [];
      experiment.ROLLOUT_RATES = {
        de: 1.0
      };
      assert.isFalse(experiment.choose(subject));
    });

    it('returns false if rollout set to 0', () => {
      experiment.FULLY_ROLLED_OUT = [];
      experiment.ROLLOUT_RATES = {
        en: 0.0
      };
      assert.isFalse(experiment.choose(subject));
    });

    it('returns false if lang is not defined', () => {
      const esSubject = Object.assign({}, subject, { lang: 'es' });
      experiment.FULLY_ROLLED_OUT = [];
      experiment.ROLLOUT_RATES = {
        'de': 0.2,
        'en': 1.0,
      };
      sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');

      assert.isFalse(experiment.choose(esSubject));
    });
  });
});
