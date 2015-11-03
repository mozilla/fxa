/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'cocktail',
  'sinon',
  'lib/promise',
  'models/notifications',
  'views/base',
  'views/mixins/signed-in-notification-mixin'
], function (chai, Cocktail, sinon, p, Notifications, BaseView,
  SignedInNotificationMixin) {
  'use strict';

  var assert = chai.assert;

  var View = BaseView.extend({});
  Cocktail.mixin(View, SignedInNotificationMixin);

  describe('views/mixins/signed-in-notification-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(SignedInNotificationMixin), 2);
      assert.isFunction(SignedInNotificationMixin.initialize);
      assert.isFunction(SignedInNotificationMixin.destroy);
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

      after(function () {
        view.destroy();
      });

      it('calls notifications.on correctly', function () {
        assert.equal(notifications.on.callCount, 1);
        var args = notifications.on.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], notifications.EVENTS.SIGNED_IN);
        assert.isFunction(args[1]);
      });

      describe('navigateToSignedInView', function () {
        before(function () {
          view.broker = {
            hasCapability: sinon.spy(function () {
              return true;
            })
          };
          view.user = {
            setSignedInAccount: sinon.spy(function () {
              return p();
            })
          };
          view.navigate = sinon.spy();
          notifications.triggerAll = sinon.spy();
          return notifications.on.args[0][1]({
            data: 'foo'
          });
        });

        it('calls broker.hasCapability correctly', function () {
          assert.equal(view.broker.hasCapability.callCount, 1);
          assert.isTrue(view.broker.hasCapability.alwaysCalledOn(view.broker));
          var args = view.broker.hasCapability.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'handleSignedInNotification');
        });

        it('calls user.setSignedInAccount correctly', function () {
          assert.equal(view.user.setSignedInAccount.callCount, 1);
          assert.isTrue(view.user.setSignedInAccount.alwaysCalledOn(view.user));
          var args = view.user.setSignedInAccount.args[0];
          assert.lengthOf(args, 1);
          assert.deepEqual(args[0], { data: 'foo' });
        });

        it('calls navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          assert.isTrue(view.navigate.alwaysCalledOn(view));
          assert.isTrue(view.navigate.calledAfter(view.user.setSignedInAccount));
          var args = view.navigate.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'settings');
        });

        it('does not call notifications.triggerAll', function () {
          assert.equal(notifications.triggerAll.callCount, 0);
        });
      });

      describe('navigateToSignedInView without handleSignedInNotification capability', function () {
        before(function () {
          view.broker = {
            hasCapability: sinon.spy(function () {
              return false;
            })
          };
          view.user = {
            setSignedInAccount: sinon.spy(function () {
              return p();
            })
          };
          view.navigate = sinon.spy();
          notifications.on.args[0][1]({
            data: 'foo'
          });
        });

        it('calls broker.hasCapability', function () {
          assert.equal(view.broker.hasCapability.callCount, 1);
        });

        it('does not call user.setSignedInAccount', function () {
          assert.equal(view.user.setSignedInAccount.callCount, 0);
        });

        it('does not call navigate', function () {
          assert.equal(view.navigate.callCount, 0);
        });
      });

      describe('navigateToSignedInView with OAuth redirect URL', function () {
        before(function () {
          view.broker = {
            hasCapability: sinon.spy(function () {
              return true;
            })
          };
          view.user = {
            setSignedInAccount: sinon.spy(function () {
              return p();
            })
          };
          view.navigate = sinon.spy();
          view._redirectTo = 'foo';
          return notifications.on.args[0][1]({
            data: 'bar'
          });
        });

        it('calls broker.hasCapability', function () {
          assert.equal(view.broker.hasCapability.callCount, 1);
        });

        it('calls user.setSignedInAccount correctly', function () {
          assert.equal(view.user.setSignedInAccount.callCount, 1);
          assert.deepEqual(view.user.setSignedInAccount.args[0][0], { data: 'bar' });
        });

        it('calls navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.args[0][0], 'foo');
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
          assert.equal(args[0], notifications.EVENTS.SIGNED_IN);
          assert.equal(args[1], notifications.on.args[0][1]);
        });
      });
    });
  });
});

