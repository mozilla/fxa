/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AccountByUidMixin from 'views/mixins/account-by-uid-mixin';
import { assert } from 'chai';
import Notifier from 'lib/channels/notifier';
import ProfileClient from 'lib/profile-client';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import SupportView from 'views/support';

sinon.spy(AccountByUidMixin.getUidAndSetSignedInAccount);

describe('views/support', function() {
  let account;
  let notifier;
  let profileClient;
  let relier;
  let user;
  let view;

  const email = 'a@a.com';
  const UID = TestHelpers.createUid();
  const subscriptionsConfig = { managementClientId: 'OVER9000' };
  const supportTicket = {
    topic: 'General inquiries',
    subject: '',
    message: 'inquiries from generals',
  };

  function createSupportView() {
    view = new SupportView({
      config: { subscriptions: subscriptionsConfig },
      notifier,
      relier,
      user,
    });
    sinon.stub(view, 'checkAuthorization').returns(Promise.resolve(true));
  }

  beforeEach(function() {
    notifier = new Notifier();
    profileClient = new ProfileClient();
    relier = new Relier();
    relier.set('uid', 'wibble');
    user = new User({
      notifier: notifier,
      profileClient: profileClient,
    });
    account = user.initAccount({
      email,
      sessionToken: 'abc123',
      uid: UID,
      verified: true,
    });
    sinon.stub(account, 'fetchProfile').returns(Promise.resolve());
    sinon.stub(account, 'hasSubscriptions').resolves(true);
    sinon.stub(user, 'getAccountByUid').returns(account);
    sinon.stub(user, 'setSignedInAccountByUid').returns(Promise.resolve());
    sinon.stub(user, 'getSignedInAccount').returns(account);

    createSupportView();
  });

  afterEach(function() {
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  it('should have a header', function() {
    return view
      .render()
      .then(function() {
        $('#container').append(view.el);
      })
      .then(function() {
        assert.ok(view.$('#fxa-settings-header').length);
        assert.ok(view.$('#fxa-settings-profile-header-wrapper').length);
        assert.equal(
          view.$('#fxa-settings-profile-header-wrapper h1').text(),
          email
        );
      });
  });

  describe('submit button', function() {
    it('should be disabled by default', function() {
      return view
        .render()
        .then(function() {
          $('#container').append(view.el);
        })
        .then(function() {
          assert.ok(view.$('form button[type=submit]').attr('disabled'));
        });
    });

    it('should be enabled once a topic is selected and a message is entered', function() {
      return view
        .render()
        .then(function() {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function() {
          view
            .$('#topic option:eq(1)')
            .prop('selected', true)
            .trigger('change');
          assert.ok(view.$('form button[type=submit]').attr('disabled'));
          view
            .$('#message')
            .val(supportTicket.message)
            .trigger('keyup');
          assert.isUndefined(
            view.$('form button[type=submit]').attr('disabled')
          );
        });
    });
  });

  describe('successful form submission', function() {
    it('should take user to subscriptions management page', function() {
      sinon.stub(view, 'navigateToSubscriptionsManagement');
      sinon
        .stub(account, 'createSupportTicket')
        .returns(Promise.resolve({ success: true }));

      return view
        .render()
        .then(function() {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function() {
          view.$('#topic option:eq(1)').prop('selected', true);
          view.$('#message').val(supportTicket.message);

          // calling this directly instead of clicking submit so we can have
          // a promise to await
          return view.submitSupportForm();
        })
        .then(function() {
          assert.isTrue(account.createSupportTicket.calledOnce);
          assert.deepEqual(
            account.createSupportTicket.firstCall.args[0],
            supportTicket
          );
          assert.isTrue(view.navigateToSubscriptionsManagement.calledOnce);
        });
    });
  });

  describe('failed form submission', function() {
    it('should display an error modal', function() {
      sinon
        .stub(account, 'createSupportTicket')
        .returns(Promise.resolve({ success: false }));

      return view
        .render()
        .then(function() {
          view.afterVisible();
          $('#container').append(view.el);
        })
        .then(function() {
          view.$('#topic option:eq(1)').prop('selected', true);
          view.$('#message').val(supportTicket.message);

          // calling this directly instead of clicking submit so we can have
          // a promise to await
          return view.submitSupportForm();
        })
        .then(function() {
          assert.ok($('.dialog-error').length);
        });
    });
  });
});
