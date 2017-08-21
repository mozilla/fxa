/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const AuthBroker = require('models/auth_brokers/base');
  const FormPrefill = require('models/form-prefill');
  const IndexView = require('views/index');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const User = require('models/user');
  const WindowMock = require('../../mocks/window');

  const EMAIL = 'testuser@testuser.com';

  describe('views/index', () => {
    let broker;
    let formPrefill;
    let notifier;
    let relier;
    let user;
    let view;
    let windowMock;

    beforeEach(() => {
      broker = new AuthBroker();
      formPrefill = new FormPrefill();
      notifier = new Notifier();
      relier = new Relier();
      windowMock = new WindowMock();

      user = new User();

      view = new IndexView({
        broker,
        formPrefill,
        notifier,
        relier,
        user,
        window: windowMock
      });

      $('body').attr('data-flow-id', 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103');
      $('body').attr('data-flow-begin', '42');
    });

    afterEach(() => {
      view.remove();
      view.destroy();

      view = null;
    });

    it('viewName is `enter-email`', () => {
      assert.equal(view.viewName, 'enter-email');
    });

    describe('render', () => {
      beforeEach(() => {
        sinon.spy(notifier, 'trigger');
        sinon.spy(view, 'navigate');
        sinon.spy(view, 'replaceCurrentPage');
      });

      describe('user is too young', () => {
        it('redirects to `/cannot_create_account`', () => {
          windowMock.document.cookie = 'tooyoung; 1';

          return view.render()
            .then(() => {
              assert.isTrue(view.navigate.calledOnce);
              assert.isTrue(view.navigate.calledWith('cannot_create_account'));
              assert.isFalse(notifier.trigger.calledWith('email-first-flow'));
            });
        });
      });

      describe('current account', () => {
        it('replaces current page with to `/settings`', function () {
          const signedInAccount = user.initAccount({
            sessionToken: 'token'
          });
          sinon.stub(user, 'getSignedInAccount', () => signedInAccount);
          return view.render()
            .then(() => {
              assert.isTrue(view.replaceCurrentPage.calledOnce);
              assert.isTrue(view.replaceCurrentPage.calledWith('settings'));
              assert.isFalse(notifier.trigger.calledWith('email-first-flow'));
            });
        });
      });

      describe('no current account', () => {
        describe('relier.action set, !== email', () => {
          it('replaces current page with page specified by `action`', () => {
            relier.set('action', 'signin');
            return view.render()
              .then(() => {
                assert.isTrue(view.replaceCurrentPage.calledOnce);
                assert.isTrue(view.replaceCurrentPage.calledWith('signin'));
                assert.isFalse(notifier.trigger.calledWith('email-first-flow'));
              });
          });
        });

        describe('relier.action set, === email', () => {
          it('replaces current page with page specified by `action`', () => {
            relier.set({
              action: 'email',
              service: 'sync',
              serviceName: 'Firefox Sync'
            });

            sinon.stub(view, 'isInEmailFirstExperimentGroup', () => false);
            sinon.spy(view, 'logFlowEventOnce');

            return view.render()
              .then(() => {
                assert.isFalse(view.replaceCurrentPage.called);

                assert.lengthOf(view.$('#fxa-enter-email-header'), 1);
                assert.lengthOf(view.$('input[type=email]'), 1);
                assert.lengthOf(view.$('#fxa-tos'), 1);
                assert.lengthOf(view.$('#fxa-pp'), 1);
                assert.include(view.$('.service').text(), 'Firefox Sync');

                assert.isTrue(notifier.trigger.calledWith('email-first-flow'));

                assert.isTrue(view.logFlowEventOnce.calledOnce);
                assert.isTrue(view.logFlowEventOnce.calledWith('begin'));
              });
          });
        });

        describe('user is in EmailFirstExperiment `treatment` group', () => {
          it('renders as expected, starts the flow metrics', () => {
            relier.set({
              service: 'sync',
              serviceName: 'Firefox Sync'
            });

            sinon.spy(view, 'logFlowEventOnce');
            sinon.stub(view, 'isInEmailFirstExperimentGroup', () => true);

            return view.render()
              .then(() => {
                assert.isFalse(view.replaceCurrentPage.called);
                assert.isFalse(view.replaceCurrentPage.called);

                assert.isTrue(view.isInEmailFirstExperimentGroup.calledOnce);
                assert.isTrue(view.isInEmailFirstExperimentGroup.calledWith('treatment'));

                assert.lengthOf(view.$('#fxa-enter-email-header'), 1);
                assert.lengthOf(view.$('input[type=email]'), 1);
                assert.lengthOf(view.$('#fxa-tos'), 1);
                assert.lengthOf(view.$('#fxa-pp'), 1);
                assert.include(view.$('.service').text(), 'Firefox Sync');

                assert.isTrue(notifier.trigger.calledWith('email-first-flow'));

                assert.isTrue(view.logFlowEventOnce.calledOnce);
                assert.isTrue(view.logFlowEventOnce.calledWith('begin'));
              });
          });
        });

        describe('user is not in EmailFirstExperiment `treatment` group', () => {
          it('redirects to `/signup`', () => {
            sinon.stub(view, 'isInEmailFirstExperimentGroup', () => false);

            return view.render()
              .then(() => {
                assert.isTrue(view.isInEmailFirstExperimentGroup.calledOnce);
                assert.isTrue(view.isInEmailFirstExperimentGroup.calledWith('treatment'));

                assert.isTrue(view.replaceCurrentPage.calledOnce);
                assert.isTrue(view.replaceCurrentPage.calledWith('signup'));
              });
          });
        });
      });
    });

    describe('submit', () => {
      it('checks the entered email', () => {
        sinon.stub(view, 'checkEmail', () => p());

        return view.render()
          .then(() => {
            view.$('input[type=email]').val(EMAIL);
          })
          .then(() => view.submit())
          .then(() => {
            assert.isTrue(view.checkEmail.calledOnce);
            assert.isTrue(view.checkEmail.calledWith(EMAIL));
          });
      });
    });

    describe('checkEmail', () => {
      beforeEach(() => {
        relier.set('action', 'email');
        sinon.stub(view, 'navigate', () => {});
        sinon.stub(broker, 'beforeSignIn', () => p());
        sinon.stub(view, 'afterRender', () => p());

        return view.render();
      });

      describe('email is registered', () => {
        it('navigates to signin', () => {
          sinon.stub(user, 'checkAccountEmailExists', () => p(true));
          return view.checkEmail(EMAIL)
            .then(() => {
              assert.isTrue(view.navigate.calledOnce);
              assert.isTrue(view.navigate.calledWith('signin'));
              const { account } = view.navigate.args[0][1];
              assert.equal(account.get('email'), EMAIL);

              assert.isTrue(broker.beforeSignIn.calledOnce);
              assert.isTrue(broker.beforeSignIn.calledWith(account));
            });
        });
      });

      describe('email is not registered', () => {
        it('navigates to signup', () => {
          sinon.stub(user, 'checkAccountEmailExists', () => p(false));
          return view.checkEmail(EMAIL)
            .then(() => {
              assert.isTrue(view.navigate.calledOnce);
              assert.isTrue(view.navigate.calledWith('signup'));
              const { account } = view.navigate.args[0][1];
              assert.equal(account.get('email'), EMAIL);

              assert.isTrue(broker.beforeSignIn.calledOnce);
              assert.isTrue(broker.beforeSignIn.calledWith(account));
            });
        });
      });
    });
  });
});
