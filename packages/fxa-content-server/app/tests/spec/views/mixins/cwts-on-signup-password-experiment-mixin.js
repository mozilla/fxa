/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'lib/cocktail';
import sinon from 'sinon';
import Mixin from 'views/mixins/cwts-on-signup-password-experiment-mixin';
import { Model, View } from 'backbone';

const SignupPasswordView = View.extend({});

Cocktail.mixin(SignupPasswordView, Mixin);

describe('views/mixins/cwts-on-signup-password-experiment-mixin', () => {
  let account;
  let context;
  let view;

  beforeEach(() => {
    account = new Model({ email: 'foomail' });
    context = new Model();
    view = new SignupPasswordView({});
    view.createExperiment = sinon.spy();
    view.getAccount = () => account;
    view.relier = new Model({ service: 'sync' });
    view.notifier = {
      trigger: sinon.spy(),
    };
    view.logViewEvent = sinon.spy();
  });

  describe('setInitialContext', () => {
    it('does not initialize experiment or set context if not part of a group', () => {
      sinon
        .stub(view, 'getCWTSOnSignupPasswordExperimentGroup')
        .callsFake(() => false);

      view.setInitialContext(context);

      assert.isFalse(view.createExperiment.called);
    });

    it('creates the experiment if part of control group, does not set context', () => {
      sinon
        .stub(view, 'getCWTSOnSignupPasswordExperimentGroup')
        .callsFake(() => 'control');

      view.setInitialContext(context);
      assert.isTrue(
        view.createExperiment.calledOnceWith('signupPasswordCWTS', 'control')
      );
      assert.lengthOf(Object.keys(context.toJSON()), 0);
    });

    it('creates the experiment if part of treatment group, sets context', () => {
      sinon
        .stub(view, 'getCWTSOnSignupPasswordExperimentGroup')
        .callsFake(() => 'treatment');
      sinon.stub(view, '_getOfferedEngines').callsFake(() => ['foo', 'bar']);

      view.setInitialContext(context);

      assert.isTrue(
        view.createExperiment.calledOnceWith('signupPasswordCWTS', 'treatment')
      );
      assert.deepEqual(context.toJSON(), {
        engines: ['foo', 'bar'],
        isCWTSOnSignupPasswordEnabled: true,
      });
    });
  });

  describe('isCWTSOnSignupPasswordEnabled', () => {
    it('returns false if not part of the experiment', () => {
      sinon
        .stub(view, 'getCWTSOnSignupPasswordExperimentGroup')
        .callsFake(() => false);
      assert.isFalse(view.isCWTSOnSignupPasswordEnabled());
    });

    it('returns false if part of control group', () => {
      sinon
        .stub(view, 'getCWTSOnSignupPasswordExperimentGroup')
        .callsFake(() => 'control');
      assert.isFalse(view.isCWTSOnSignupPasswordEnabled());
    });

    it('returns true if part of treatment group', () => {
      sinon
        .stub(view, 'getCWTSOnSignupPasswordExperimentGroup')
        .callsFake(() => 'treatment');
      assert.isTrue(view.isCWTSOnSignupPasswordEnabled());
    });
  });

  describe('beforeSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, '_trackDeclinedEngineIds');
    });
    it(' if not in treatment group, does nothing', () => {
      sinon.stub(view, 'isCWTSOnSignupPasswordEnabled').callsFake(() => false);

      view.beforeSubmit();

      assert.isFalse(account.has('declinedSyncEngines'));
      assert.isFalse(account.has('offeredSyncEngines'));
      assert.isFalse(view._trackDeclinedEngineIds.called);
      assert.isFalse(view.notifier.trigger.called);
    });

    it('if in treatment group, updates account, tracks declined engines, notifies', () => {
      sinon.stub(view, 'isCWTSOnSignupPasswordEnabled').callsFake(() => true);
      sinon
        .stub(view, '_getOfferedEngineIds')
        .callsFake(() => ['foo', 'bar', 'baz']);
      sinon.stub(view, '_getDeclinedEngineIds').callsFake(() => ['foo', 'baz']);

      view.beforeSubmit();

      assert.deepEqual(account.get('declinedSyncEngines'), ['foo', 'baz']);
      assert.deepEqual(account.get('offeredSyncEngines'), [
        'foo',
        'bar',
        'baz',
      ]);
      assert.isTrue(
        view._trackDeclinedEngineIds.calledOnceWith(['foo', 'baz'])
      );
      assert.isTrue(
        view.notifier.trigger.calledOnceWith('set-sync-engines', ['bar'])
      );
    });
  });
});
