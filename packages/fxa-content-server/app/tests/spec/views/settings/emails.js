/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const assert = require('chai').assert;
  const BaseBroker = require('models/auth_brokers/base');
  const BaseView = require('views/base');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const Translator = require('lib/translator');
  const User = require('models/user');
  const View = require('views/settings/emails');
  const WindowMock = require('../../../mocks/window');

  describe('views/settings/emails', function () {
    let account;
    let emails;
    let broker;
    let email;
    let metrics;
    let notifier;
    let parentView;
    let translator;
    const UID = '123';
    let user;
    let view;
    let windowMock;

    function initView() {
      view = new View({
        broker: broker,
        emails: emails,
        metrics: metrics,
        notifier: notifier,
        parentView: parentView,
        translator: translator,
        user: user,
        window: windowMock
      });

      return view.render();
    }

    beforeEach(() => {
      broker = new BaseBroker();
      email = TestHelpers.createEmail();
      notifier = new Notifier();
      metrics = new Metrics({notifier});
      parentView = new BaseView();
      translator = new Translator({forceEnglish: true});
      user = new User();
      windowMock = new WindowMock();
      windowMock.location.search = '?canChangeEmail=true';

      account = user.initAccount({
        email: email,
        sessionToken: 'abc123',
        uid: UID,
        verified: true
      });

      emails = [];

      sinon.stub(user, 'getSignedInAccount').callsFake(() => {
        return account;
      });
    });

    afterEach(() => {
      if ($.prototype.trigger.restore) {
        $.prototype.trigger.restore();
      }
      view.remove();
      view.destroy();

      view = null;
    });

    describe('constructor', () => {
      beforeEach(() => {
        view = new View({
          notifier: notifier,
          parentView: parentView,
          user: user
        });
      });

      it('creates `Email` instances if passed in', () => {
        assert.ok(view._emails);
      });
    });

    describe('feature gated in unverified session', () => {
      beforeEach(() => {
        sinon.stub(account, 'sessionVerificationStatus').callsFake(() => {
          return Promise.resolve({sessionVerified: false});
        });
      });

      describe('shows upgrade session', () => {
        beforeEach(() => {
          emails = [{
            email: 'primary@email.com',
            isPrimary: true,
            verified: true
          }];
          return initView();
        });

        it('has upgrade session panel', () => {
          assert.ok(view.$('.email-address .address').length, 1);
          assert.equal(view.$('.email-address .address').text(), email);
        });
      });
    });

    describe('feature enabled', () => {
      beforeEach(() => {
        sinon.stub(account, 'recoveryEmails').callsFake(() => {
          return Promise.resolve(emails);
        });

        sinon.stub(account, 'sessionVerificationStatus').callsFake(() => {
          return Promise.resolve({ sessionVerified: true });
        });

        sinon.stub(account, 'recoveryEmailDestroy').callsFake(() => {
          return Promise.resolve();
        });

        sinon.stub(account, 'resendEmailCode').callsFake(() => {
          return Promise.resolve();
        });

        sinon.stub(account, 'setPrimaryEmail').callsFake((newEmail) => {
          email = newEmail;
          return Promise.resolve();
        });
      });

      describe('with no secondary email', () => {
        beforeEach(() => {
          emails = [{
            email: 'primary@email.com',
            isPrimary: true,
            verified: true
          }];
          return initView();
        });

        it('has email input field', function () {
          assert.ok(view.$('input.new-email').length, 1);
          assert.ok(view.$('.email-add.primary').length, 1);
        });
      });

      describe('with unverified secondary email', () => {
        beforeEach(() => {
          emails = [{
            email: 'primary@email.com',
            isPrimary: true,
            verified: true
          }, {
            email: 'another@one.com',
            isPrimary: false,
            verified: false
          }];

          return initView()
            .then(function () {
              // click events require the view to be in the DOM
              $('#container').html(view.el);
              sinon.spy(view, 'navigate');
              sinon.spy(view, 'displaySuccess');
            });
        });

        it('can render', () => {
          assert.equal(view.$('.email-address').length, 1);
          assert.lengthOf(view.$('.email-address .address'), 1);
          assert.equal(view.$('.email-address .address').html(), 'another@one.com');
          assert.equal(view.$('.email-address .details .not-verified').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').attr('data-id'), 'another@one.com');
          assert.equal(view.$('.email-address .settings-button.secondary.set-primary').length, 0);

        });

        it('can disconnect email and navigate to /emails', (done) => {
          $('.email-address .settings-button.warning.email-disconnect').click();
          setTimeout(function () {
            TestHelpers.wrapAssertion(() => {
              assert.isTrue(view.navigate.calledOnce);
              const args = view.navigate.args[0];
              assert.equal(args.length, 1);
              assert.equal(args[0], '/settings');
              assert.equal(view.displaySuccess.callCount, 1);
            }, done);
          }, 150);
        });

        it('calls `render` when refreshed', (done) => {
          $('.email-refresh').click();
          sinon.spy(view, 'render');
          setTimeout(function () {
            TestHelpers.wrapAssertion(() => {
              assert.isTrue(view.render.calledOnce);
            }, done);
          }, 450); // Delay is higher here because refresh has a min delay of 350
        });

        it('calls `render` when resend and navigate to /emails', (done) => {
          $('.resend').click();
          sinon.spy(view, 'render');
          setTimeout(function () {
            TestHelpers.wrapAssertion(() => {
              assert.isTrue(view.navigate.calledOnce);
              const args = view.navigate.args[0];
              assert.equal(args.length, 1);
              assert.equal(args[0], '/settings/emails');
            }, done);
          }, 150);
        });

        it('panel always open when unverified secondary email', () => {
          assert.equal(view.isPanelOpen(), true);
        });
      });

      describe('with verified secondary email', () => {
        beforeEach(() => {
          emails = [{
            email: 'primary@email.com',
            isPrimary: true,
            verified: true
          }, {
            email: 'another@one.com',
            isPrimary: false,
            verified: true
          }];

          return initView()
            .then(function () {
              // click events require the view to be in the DOM
              $('#container').html(view.el);
              sinon.spy(view, 'navigate');
              sinon.spy(view, 'displaySuccess');
            });
        });

        it('can render', () => {
          assert.equal(view.$('.email-address').length, 1);
          assert.lengthOf(view.$('.email-address .address'), 1);
          assert.equal(view.$('.email-address .address').html(), 'another@one.com');
          assert.equal(view.$('.email-address .details .verified').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').attr('data-id'), 'another@one.com');
        });

        it('can disconnect email and navigate to /emails', (done) => {
          $('.email-address .settings-button.warning.email-disconnect').click();
          setTimeout(() => {
            TestHelpers.wrapAssertion(() => {
              assert.isTrue(view.navigate.calledOnce);
              const args = view.navigate.args[0];
              assert.equal(args.length, 1);
              assert.equal(args[0], '/settings');
              assert.equal(view.displaySuccess.callCount, 1);
            }, done);
          }, 150);
        });

        it('panel closed when verified secondary email', () => {
          assert.equal(view.isPanelOpen(), false);
        });
      });

      describe('does not show change email when `canChangeEmail` not set', () => {
        const newEmail = 'secondary@email.com';
        beforeEach(() => {
          emails = [{
            email: 'primary@email.com',
            isPrimary: true,
            verified: true
          }, {
            email: newEmail,
            isPrimary: false,
            verified: true
          }];

          windowMock.location.search = '';

          return initView()
            .then(function () {
              // click events require the view to be in the DOM
              $('#container').html(view.el);
            });
        });

        it('can render', () => {
          assert.equal(view.$('.email-address').length, 1);
          assert.lengthOf(view.$('.email-address .address'), 1);
          assert.equal(view.$('.email-address .address').html(), 'secondary@email.com');
          assert.equal(view.$('.email-address .details .verified').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').attr('data-id'), 'secondary@email.com');
          assert.equal(view.$('.email-address .settings-button.secondary.set-primary').length, 0);
        });
      });


      describe('can change email', () => {
        const newEmail = 'secondary@email.com';
        beforeEach(() => {
          emails = [{
            email: 'primary@email.com',
            isPrimary: true,
            verified: true
          }, {
            email: newEmail,
            isPrimary: false,
            verified: true
          }];

          return initView()
            .then(function () {
              // click events require the view to be in the DOM
              $('#container').html(view.el);
            });
        });

        it('can render', () => {
          assert.equal(view.$('.email-address').length, 1);
          assert.lengthOf(view.$('.email-address .address'), 1);
          assert.equal(view.$('.email-address .address').html(), 'secondary@email.com');
          assert.equal(view.$('.email-address .details .verified').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').length, 1);
          assert.equal(view.$('.email-address .settings-button.warning.email-disconnect').attr('data-id'), 'secondary@email.com');
          assert.equal(view.$('.email-address .settings-button.secondary.set-primary').length, 1);
          assert.equal(view.$('.email-address .settings-button.secondary.set-primary').attr('data-id'), 'secondary@email.com');
        });

        it('can change email', (done) => {
          $('.email-address .settings-button.secondary.set-primary').click();
          setTimeout(() => {
            TestHelpers.wrapAssertion(() => {
              assert.equal(account.get('email'), newEmail, 'account email updated');
            }, done);
          }, 150);
        });
      });

    });
  });
});
