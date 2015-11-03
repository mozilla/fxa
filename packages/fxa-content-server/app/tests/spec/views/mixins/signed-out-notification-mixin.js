/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'cocktail',
  'sinon',
  'models/notifications',
  'views/base',
  'views/mixins/signed-out-notification-mixin'
], function (chai, Cocktail, sinon, Notifications, BaseView,
  SignedOutNotificationMixin) {
  'use strict';

  var assert = chai.assert;

  var View = BaseView.extend({});
  Cocktail.mixin(View, SignedOutNotificationMixin);

  describe('views/mixins/signed-out-notification-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(SignedOutNotificationMixin), 2);
      assert.isFunction(SignedOutNotificationMixin.initialize);
      assert.isFunction(SignedOutNotificationMixin.destroy);
    });

    describe('new View', function () {
      var notifications;
      var view;

      before(function () {
        notifications = new Notifications();
        notifications.on = sinon.spy();
        view = new View({
          notifications: notifications
        });
      });

      afterEach(function () {
        view.destroy();
      });

      it('calls notifications.on correctly', function () {
        assert.equal(notifications.on.callCount, 1);
        var args = notifications.on.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'fxaccounts:logout');
        assert.isFunction(args[1]);
      });

      describe('clearSessionAndNavigateToSignIn', function () {
        before(function () {
          view.relier = {
            unset: sinon.spy()
          };
          view.user = {
            clearSignedInAccountUid: sinon.spy()
          };
          view._formPrefill = {
            clear: sinon.spy()
          };
          view.navigate = sinon.spy();
          notifications.triggerAll = sinon.spy();
          notifications.on.args[0][1]();
        });

        it('calls relier.unset correctly', function () {
          assert.equal(view.relier.unset.callCount, 3);

          assert.lengthOf(view.relier.unset.args[0], 1);
          assert.equal(view.relier.unset.args[0][0], 'uid');

          assert.lengthOf(view.relier.unset.args[1], 1);
          assert.equal(view.relier.unset.args[1][0], 'email');

          assert.lengthOf(view.relier.unset.args[2], 1);
          assert.equal(view.relier.unset.args[2][0], 'preVerifyToken');
        });

        it('calls user.clearSignedInAccountUid correctly', function () {
          assert.equal(view.user.clearSignedInAccountUid.callCount, 1);
          assert.lengthOf(view.user.clearSignedInAccountUid.args[0], 0);
        });

        it('calls _formPrefill.clear correctly', function () {
          assert.equal(view._formPrefill.clear.callCount, 1);
          assert.lengthOf(view._formPrefill.clear.args[0], 0);
        });

        it('calls navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          assert.isTrue(view.navigate.calledAfter(view.user.clearSignedInAccountUid));
          assert.isTrue(view.navigate.calledAfter(view._formPrefill.clear));
          var args = view.navigate.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'signin');
          assert.isObject(args[1]);
          assert.lengthOf(Object.keys(args[1]), 2);
          assert.isTrue(args[1].clearQueryParams);
          assert.equal(args[1].success, 'Signed out successfully');
        });

        it('does not call notifications.triggerAll', function () {
          assert.equal(notifications.triggerAll.callCount, 0);
        });
      });

      describe('destroy', function () {
        beforeEach(function () {
          notifications.off = sinon.spy();
          view.destroy();
        });

        it('calls notifications.off correctly', function () {
          assert.equal(notifications.off.callCount, 1);
          var args = notifications.off.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], notifications.EVENTS.SIGNED_OUT);
          assert.equal(args[1], notifications.on.args[0][1]);
        });
      });
    });
  });
});

