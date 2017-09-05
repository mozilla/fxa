/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const AuthBroker = require('models/auth_brokers/base');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const EmailFirstExperimentMixin = require('views/mixins/email-first-experiment-mixin');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');

  class View extends BaseView {
    constructor (options) {
      super(options);
      this.className = 'redirects';
    }
  }

  Cocktail.mixin(
    View,
    EmailFirstExperimentMixin({ treatmentPathname: '/' })
  );

  describe('views/mixins/email-first-experiment-mixin', () => {
    let broker;
    let notifier;
    let sandbox;
    let view;

    before(() => {
      sandbox = sinon.sandbox.create();

      broker = new AuthBroker();
      broker.setCapability('emailFirst', true);
      notifier = new Notifier();

      view = new View({
        broker,
        notifier,
        viewName: 'email'
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    after(() => {
      view.remove();
      view.destroy();

      view = null;
    });

    it('exposes the expected interface', () => {
      const mixin = EmailFirstExperimentMixin();
      assert.lengthOf(Object.keys(mixin), 6);
      assert.isArray(mixin.dependsOn);
      assert.isFunction(mixin.beforeRender);
      assert.isFunction(mixin.getEmailFirstExperimentGroup);
      assert.isFunction(mixin.isInEmailFirstExperiment);
      assert.isFunction(mixin.isInEmailFirstExperimentGroup);
      assert.isFunction(mixin._getEmailFirstExperimentSubject);
    });

    it('_getEmailFirstExperimentSubject returns the expected object', () => {
      assert.deepEqual(view._getEmailFirstExperimentSubject(), {
        isEmailFirstSupported: true
      });
    });

    it('isInEmailFirstExperiment delegates to `isInExperiment` correctly', () => {
      sandbox.spy(view, '_getEmailFirstExperimentSubject');
      sandbox.stub(view, 'isInExperiment').callsFake(() => true);

      assert.isTrue(view.isInEmailFirstExperiment());

      assert.isTrue(view.isInExperiment.calledOnce);
      assert.isTrue(view.isInExperiment.calledWith(
        'emailFirst',
        {
          isEmailFirstSupported: true
        }
      ));
    });

    it('isInEmailFirstExperimentGroup delegates to `isInExperimentGroup` correctly', () => {
      sandbox.spy(view, '_getEmailFirstExperimentSubject');
      sandbox.stub(view, 'isInExperimentGroup').callsFake(() => true);

      assert.isTrue(view.isInEmailFirstExperimentGroup('treatment'));

      assert.isTrue(view.isInExperimentGroup.calledOnce);
      assert.isTrue(view.isInExperimentGroup.calledWith(
        'emailFirst',
        'treatment',
        {
          isEmailFirstSupported: true
        }
      ));
    });

    describe('beforeRender', () => {
      beforeEach(() => {
        sandbox.spy(view, 'createExperiment');
        sandbox.spy(view, 'replaceCurrentPage');
      });

      it('does nothing for users not in the experiment', () => {
        sandbox.stub(view, 'isInEmailFirstExperiment').callsFake(() => false);
        sandbox.stub(view, 'isInEmailFirstExperimentGroup').callsFake(() => false);

        view.beforeRender();

        assert.isTrue(view.isInEmailFirstExperiment.calledOnce);
        assert.isFalse(view.createExperiment.called);
        assert.isFalse(view.replaceCurrentPage.called);
      });

      it('creates the experiment for users in the control group, does not redirect', () => {
        sandbox.stub(view, 'isInEmailFirstExperiment').callsFake(() => true);
        sandbox.stub(view, 'getEmailFirstExperimentGroup').callsFake(() => 'control');

        view.beforeRender();

        assert.isTrue(view.isInEmailFirstExperiment.calledOnce);

        assert.isTrue(view.createExperiment.calledOnce);
        assert.isTrue(view.createExperiment.calledWith('emailFirst', 'control'));

        assert.isFalse(view.replaceCurrentPage.called);
      });

      it('creates the experiment for users in the treatment group, redirects if treatmentPathname specified', () => {
        sandbox.stub(view, 'isInEmailFirstExperiment').callsFake(() => true);
        sandbox.stub(view, 'getEmailFirstExperimentGroup').callsFake(() => 'treatment');

        view.beforeRender();

        assert.isTrue(view.createExperiment.calledOnce);
        assert.isTrue(view.createExperiment.calledWith('emailFirst', 'treatment'));

        assert.isTrue(view.replaceCurrentPage.calledOnce);
        assert.isTrue(view.replaceCurrentPage.calledWith('/'));
      });
    });
  });
});
