/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import Experiment from 'lib/experiments/grouping-rules/signup-code';
import sinon from 'sinon';

const ROLLOUT_CLIENTS = {
  '3a1f53aabe17ba32': {
    name: 'Firefox Add-ons',
    rolloutRate: 0.0, // Rollout rate between 0..1
  },
  dcdb5ae7add825d2: {
    name: '123Done',
    rolloutRate: 1.0,
  },
  ecdb5ae7add825d4: {
    enableTestEmails: true,
    name: 'TestClient',
    rolloutRate: 0.0,
  },
};

describe('lib/experiments/grouping-rules/signup-code', () => {
  describe('choose', () => {
    let account;
    let experiment;
    let subject;

    beforeEach(() => {
      account = new Account();
      experiment = new Experiment();
      experiment.ROLLOUT_CLIENTS = ROLLOUT_CLIENTS;
      subject = {
        account,
        experimentGroupingRules: {},
        isSignupCodeSupported: true,
        service: null,
        uniqueUserId: 'user-id',
      };
    });

    it('returns false experiment not enabled', () => {
      subject = {
        isSignupCodeSupported: false,
      };
      assert.equal(experiment.choose(subject), false);
    });

    describe('with oauth client', () => {
      it('returns false if client not defined in config', () => {
        subject.clientId = 'invalidClientId';
        assert.equal(experiment.choose(subject), false);
      });

      it('returns false if client rollout is 0', () => {
        subject.clientId = '3a1f53aabe17ba32';
        assert.equal(experiment.choose(subject), false);
      });

      it('delegates to uniformChoice', () => {
        subject.clientId = 'dcdb5ae7add825d2';
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
        experiment.choose(subject);
        assert.isTrue(experiment.uniformChoice.calledOnce);
        assert.isTrue(
          experiment.uniformChoice.calledWith(['treatment'], 'user-id')
        );
      });

      it('delegates to uniformChoice when `enableTestEmails` is true and using test email', () => {
        subject.clientId = 'ecdb5ae7add825d4';
        subject.account.set('email', 'a@mozilla.org');
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
        experiment.choose(subject);
        assert.isTrue(experiment.uniformChoice.calledOnce);
        assert.isTrue(
          experiment.uniformChoice.calledWith(['treatment'], 'user-id')
        );
      });

      it('featureFlags take precedence', () => {
        subject.clientId = 'invalidClientId';
        assert.equal(
          experiment.choose(
            Object.assign(
              {
                featureFlags: {
                  signupCodeClients: {
                    invalidClientId: {
                      groups: ['treatment'],
                      rolloutRate: 1,
                    },
                  },
                },
              },
              subject
            )
          ),
          ['treatment']
        );
      });
    });

    describe('with sync', () => {
      beforeEach(() => {
        subject.service = 'sync';
      });

      it('returns false if not Sync', () => {
        subject.service = 'notSync';
        assert.equal(experiment.choose(subject), false);
      });

      it('returns false if rollout is 0', () => {
        experiment.SYNC_ROLLOUT_RATE = 0.0;
        assert.equal(experiment.choose(subject), false);
      });

      it('delegates to uniformChoice', () => {
        experiment.SYNC_ROLLOUT_RATE = 1.0;
        sinon.stub(experiment, 'uniformChoice').callsFake(() => 'control');
        experiment.choose(subject);
        assert.isTrue(experiment.uniformChoice.calledOnce, 'called once');
        assert.isTrue(
          experiment.uniformChoice.calledWith(['treatment'], 'user-id')
        );
      });

      it('featureFlags take precedence', () => {
        assert.isFalse(
          experiment.choose(
            Object.assign({
              featureFlags: {
                signupCodeClients: {
                  sync: {
                    groups: ['treatment'],
                    rolloutRate: 0,
                  },
                },
              },
              subject,
            })
          )
        );
      });
    });
  });
});
