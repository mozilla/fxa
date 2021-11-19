/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AccountByUidMixin from 'views/mixins/account-by-uid-mixin';
import { assert } from 'chai';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import ProfileClient from 'lib/profile-client';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import SupportView from 'views/support';
import SubscriptionModel from 'models/subscription';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';

sinon.spy(AccountByUidMixin.getUidAndSetSignedInAccount);

describe('views/support', function () {
  let account;
  let metrics;
  let notifier;
  let profileClient;
  let relier;
  let user;
  let view;

  const email = 'a@a.com';
  const UID = TestHelpers.createUid();
  const subscriptionsConfig = { managementClientId: 'OVER9000' };
  const supportTicket = {
    productName: 'FxA - 123Done Pro',
    topic: 'Payment & billing',
    app: 'Mobile',
    subject: '',
    message: 'inquiries from generals',
  };

  function createSupportView() {
    view = new SupportView({
      config: { subscriptions: subscriptionsConfig },
      metrics,
      notifier,
      relier,
      user,
    });
    $('body').attr(
      'data-flow-id',
      'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
    );
    $('body').attr('data-flow-begin', '42');
    sinon.stub(view, 'checkAuthorization').returns(Promise.resolve(true));
  }

  beforeEach(function () {
    notifier = new Notifier();
    metrics = new Metrics({
      notifier,
      sentryMetrics: {
        captureException() {},
      },
    });
    // prevents metrics from being flushed
    // so we can check if they were emit
    sinon.stub(metrics, 'flush');

    sinon.spy(notifier, 'trigger');
    profileClient = new ProfileClient();
    relier = new Relier();
    relier.set('uid', 'wibble');
    user = new User({
      metrics,
      notifier,
      profileClient,
    });
    account = user.initAccount({
      email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    sinon.stub(account, 'fetchProfile').returns(Promise.resolve());
    sinon.stub(account, 'getSubscriptions').resolves([
      {
        plan_id: '123done_9001',
        product_id: '123done_xyz',
        product_name: '123Done Pro',
      },
    ]);
    sinon.stub(account, 'fetchSubscriptionPlans').resolves([
      {
        plan_id: '123done_9001',
        product_id: '123done_xyz',
        product_name: '123Done Pro',
        product_metadata: {
          'support:app:foo': 'Mobile',
          'support:app:bar': 'Desktop',
        },
      },
      {
        plan_id: 'foobar_9001',
        product_id: 'foobar_plus',
        product_name: 'FooBar Plus',
        product_metadata: {},
      },
    ]);
    sinon.stub(user, 'getAccountByUid').returns(account);
    sinon.stub(user, 'setSignedInAccountByUid').returns(Promise.resolve());
    sinon.stub(user, 'getSignedInAccount').returns(account);

    createSupportView();
  });

  afterEach(function () {
    metrics.destroy();
    metrics = null;
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  it('should have a header', function () {
    return view
      .render()
      .then(function () {
        $('#container').append(view.el);
      })
      .then(function () {
        assert.ok(view.$('#fxa-settings-header').length);
        assert.ok(view.$('#fxa-settings-profile-header-wrapper').length);
        assert.equal(
          view.$('#fxa-settings-profile-header-wrapper h1').text(),
          email
        );
      });
  });

  describe('product name', function () {
    it('should be the prefixed product name of the selected plan', function () {
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view
            .$('#product option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.equal(
            view.supportForm.get('productName'),
            'FxA - 123Done Pro'
          );
        });
    });

    describe('app/service name', function () {
      it('should be selectable once a product is selected', function () {
        return view
          .render()
          .then(() => {
            view.afterVisible();
            $('#container').append(view.el);
          })
          .then(() => assert.isTrue(view.$('#app').prop('disabled')))
          .then(() =>
            assert.isFalse(view.$('#app').parent().parent().is(':visible'))
          )
          .then(() => {
            view.$('#product option:eq(1)').prop('selected', true);
            view.$('#product').trigger('change');
          })
          .then(() => new Promise((resolve) => setTimeout(resolve, 500)))
          .then(() => assert.isFalse(view.$('#app').prop('disabled')))
          .then(() =>
            assert.isTrue(view.$('#app').parent().parent().is(':visible'))
          )
          .then(() => {
            view.$('#product option:eq(2)').prop('selected', true);
            view.$('#product').trigger('change');
          })
          .then(() => new Promise((resolve) => setTimeout(resolve, 500)))
          .then(() => assert.isTrue(view.$('#app').prop('disabled')))
          .then(() =>
            assert.isFalse(view.$('#app').parent().parent().is(':visible'))
          );
      });
    });

    it('emits subscription.initialize correctly', () => {
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view
            .$('#product option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.equal(notifier.trigger.callCount, 5);
          const args = notifier.trigger.args[4];
          assert.lengthOf(args, 3);
          assert.equal(args[0], 'subscription.initialize');
          assert.instanceOf(args[1], SubscriptionModel);
          assert.equal(args[1].get('planId'), '123done_9001');
          assert.equal(args[1].get('productId'), '123done_xyz');
        });
    });

    it('uses the SKU in place for plan ID in metrics when given a Google Play Subscription', () => {
      account.getSubscriptions.restore();
      sinon.stub(account, 'getSubscriptions').resolves([
        {
          product_id: '123done_xyz',
          product_name: '123Done Pro',
          sku: 'com.moz.stuff.cool',
        },
      ]);
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view
            .$('#product option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.equal(notifier.trigger.callCount, 5);
          const args = notifier.trigger.args[4];
          assert.lengthOf(args, 3);
          assert.equal(args[0], 'subscription.initialize');
          assert.instanceOf(args[1], SubscriptionModel);
          assert.equal(args[1].get('planId'), 'com.moz.stuff.cool');
          assert.equal(args[1].get('productId'), '123done_xyz');
        });
    });

    it('should be prefixed "Other" when "Other" is selected', function () {
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view
            .$('#product option:eq(2)')
            .prop('selected', true)
            .trigger('change');
          assert.equal(view.supportForm.get('productName'), 'FxA - Other');
        });
    });
  });

  describe('flow events', () => {
    it('logs the engage event (change)', () => {
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          assert.isFalse(
            TestHelpers.isEventLogged(metrics, 'flow.support.engage')
          );
          view
            .$('#product option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'flow.support.engage')
          );
        });
    });
  });

  describe('submit button', function () {
    it('should be disabled by default', function () {
      return view
        .render()
        .then(function () {
          $('#container').append(view.el);
        })
        .then(function () {
          assert.ok(view.$('form button[type=submit]').prop('disabled'));
        });
    });

    it('should be enabled once a product, a topic, and a message is entered', function () {
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view
            .$('#product option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.ok(view.$('form button[type=submit]').prop('disabled'));
          view
            .$('#topic option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.ok(view.$('form button[type=submit]').prop('disabled'));
          view.$('#message').val(supportTicket.message).trigger('keyup');
          assert.isFalse(view.$('form button[type=submit]').prop('disabled'));
        });
    });

    it('should disable buttons and show spinner on submit click', function () {
      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view.$('#product option:eq(1)').prop('selected', true);
          view.$('#topic option:eq(1)').prop('selected', true);
          view.$('#message').val(supportTicket.message).trigger('keyup');
          view.$('form button[type=submit]').click();
        })
        .then(function () {
          assert.ok(view.$('form button[type=submit]').prop('disabled'));
          assert.ok(view.$('form button.cancel').prop('disabled'));
          assert.ok(view.$('.submit-content').hasClass('hidden'));
          assert.isFalse(view.$('form .spinner').hasClass('hidden'));
        });
    });

    it('should enable buttons and hide spinner on submit handle', function () {
      sinon.stub(view, 'navigateToSubscriptionsManagement');
      sinon
        .stub(account, 'createSupportTicket')
        .returns(Promise.resolve({ success: true }));
      sinon.spy(view, 'logFlowEvent');

      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view.$('#product option:eq(1)').prop('selected', true);
          view.$('#topic option:eq(1)').prop('selected', true);
          view.$('#message').val(supportTicket.message).trigger('keyup');

          // calling this directly instead of clicking submit so we can have
          // a promise to await
          return view.submitSupportForm();
        })
        .then(function () {
          assert.isFalse(
            view.$('form button[type=submit]').hasClass('disabled')
          );
          assert.isFalse(view.$('form button.cancel').hasClass('disabled'));
          assert.isFalse(view.$('.submit-content').hasClass('hidden'));
          assert.ok(view.$('form .spinner').hasClass('hidden'));
        });
    });
  });

  describe('successful form submission', function () {
    it('should display a success modal', function () {
      sinon.stub(view, 'navigateToSubscriptionsManagement');
      sinon
        .stub(account, 'createSupportTicket')
        .returns(Promise.resolve({ success: true }));
      sinon.spy(view, 'logFlowEvent');

      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view.$('#product option:eq(1)').prop('selected', true);
          view.$('#product').trigger('change');
          view.$('#topic option:eq(1)').prop('selected', true);
          view.$('#app option:eq(1)').prop('selected', true);
          view.$('#message').val(supportTicket.message).trigger('keyup');

          // calling this directly instead of clicking submit so we can have
          // a promise to await
          return view.submitSupportForm();
        })
        .then(function () {
          assert.isTrue(account.createSupportTicket.calledOnce);
          assert.deepEqual(
            account.createSupportTicket.firstCall.args[0],
            supportTicket
          );
          assert.ok($('.dialog-success').length);
          assert.equal(view.logFlowEvent.callCount, 4);
          assert.deepEqual(view.logFlowEvent.getCall(0).args, [
            'engage',
            'support',
            { once: true },
          ]);
          assert.deepEqual(view.logFlowEvent.getCall(1).args, [
            'submit',
            'support',
          ]);
          assert.deepEqual(view.logFlowEvent.getCall(2).args, [
            'success',
            'support',
          ]);
          assert.deepEqual(view.logFlowEvent.getCall(3).args, [
            'complete',
            'support',
          ]);
        });
    });
  });

  describe('failed form submission', function () {
    it('should display an error modal', function () {
      sinon
        .stub(account, 'createSupportTicket')
        .returns(Promise.resolve({ success: false }));
      sinon.spy(view, 'logFlowEvent');

      return view
        .render()
        .then(function () {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function () {
          view.$('#topic option:eq(1)').prop('selected', true);
          view.$('#message').val(supportTicket.message);

          // calling this directly instead of clicking submit so we can have
          // a promise to await
          return view.submitSupportForm();
        })
        .then(function () {
          assert.ok($('.dialog-error').length);
          assert.equal(view.logFlowEvent.callCount, 2);
          assert.deepEqual(view.logFlowEvent.getCall(0).args, [
            'submit',
            'support',
          ]);
          assert.deepEqual(view.logFlowEvent.getCall(1).args, [
            'fail',
            'support',
          ]);
        });
    });
  });
});
