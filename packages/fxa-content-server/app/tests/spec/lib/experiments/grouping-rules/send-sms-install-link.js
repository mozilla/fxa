/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import CountryTelephoneInfo from 'lib/country-telephone-info';
import Experiment from 'lib/experiments/grouping-rules/send-sms-install-link';
import sinon from 'sinon';

describe('lib/experiments/grouping-rules/send-sms-install-link', () => {
  let account;
  const country = 'GB';
  let experiment;

  beforeEach(() => {
    account = new Account({ email: 'testuser@testuser.com' });
    experiment = new Experiment();
  });

  describe('choose', () => {
    it('returns false if pre-reqs not met', () => {
      assert.isFalse(experiment.choose({ country, uniqueUserId: 'user-id' }));
      assert.isFalse(experiment.choose({ account, uniqueUserId: 'user-id' }));
      assert.isFalse(experiment.choose({ account, country }));
    });

    it('`signinCodes` returned if email forced', () => {
      account.set('email', 'testuser@softvision.com');
      assert.equal(
        experiment.choose({ account, country, uniqueUserId: 'user-id' }),
        'signinCodes'
      );
      account.set('email', 'testuser@softvision.ro');
      assert.equal(
        experiment.choose({ account, country, uniqueUserId: 'user-id' }),
        'signinCodes'
      );
      account.set('email', 'testuser@mozilla.com');
      assert.equal(
        experiment.choose({ account, country, uniqueUserId: 'user-id' }),
        'signinCodes'
      );
      account.set('email', 'testuser@mozilla.org');
      assert.equal(
        experiment.choose({ account, country, uniqueUserId: 'user-id' }),
        'signinCodes'
      );
    });

    describe('country does not have a `rolloutRate`', () => {
      beforeEach(() => {
        delete CountryTelephoneInfo.GB.rolloutRate;
      });

      it('returns `false`', () => {
        assert.isFalse(
          experiment.choose({ account, country, uniqueUserId: 'user-id' })
        );
      });

      it('featureFlags take precedence', () => {
        assert.equal(
          'GB',
          experiment.choose({
            account,
            country,
            featureFlags: {
              smsCountries: {
                GB: {
                  rolloutRate: 1,
                },
              },
            },
            uniqueUserId: 'wibble',
          })
        );
      });
    });

    describe('country has a `rolloutRate`', () => {
      beforeEach(() => {
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'choice');
        CountryTelephoneInfo.GB.rolloutRate = 0.5;
      });

      afterEach(() => {
        delete CountryTelephoneInfo.GB.rolloutRate;
      });

      it('user not selected for trail returns `false`', () => {
        sinon.stub(experiment, 'bernoulliTrial').callsFake(() => false);

        assert.isFalse(
          experiment.choose({ account, country, uniqueUserId: 'user-id' })
        );
        assert.isTrue(experiment.bernoulliTrial.called);
        assert.isTrue(experiment.bernoulliTrial.calledWith(0.5, 'user-id'));
        assert.isFalse(experiment.uniformChoice.called);
      });

      it('user selected for trial delegates to `uniformChoice`', () => {
        sinon.stub(experiment, 'bernoulliTrial').callsFake(() => true);

        assert.equal(
          experiment.choose({ account, country, uniqueUserId: 'user-id' }),
          'choice'
        );
        assert.isTrue(experiment.bernoulliTrial.called);
        assert.isTrue(experiment.bernoulliTrial.calledWith(0.5, 'user-id'));
        assert.isTrue(experiment.uniformChoice.called);
        assert.isTrue(
          experiment.uniformChoice.calledWith(
            ['control', 'signinCodes'],
            'user-id'
          )
        );
      });

      it('fully rolled out countries return country', () => {
        CountryTelephoneInfo.GB.rolloutRate = 1.0;
        assert.equal(
          'GB',
          experiment.choose({ account, country, uniqueUserId: 'user-id' })
        );
      });

      it('featureFlags take precedence', () => {
        CountryTelephoneInfo.GB.rolloutRate = 1.0;
        assert.isFalse(
          experiment.choose({
            account,
            country,
            featureFlags: {
              smsCountries: {},
            },
            uniqueUserId: 'wibble',
          })
        );
      });
    });
  });
});
