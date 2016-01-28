/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var SignedInNotificationMixin = require('views/mixins/signed-in-notification-mixin');
  var sinon = require('sinon');

  var assert = chai.assert;

  var View = BaseView.extend({});
  Cocktail.mixin(View, SignedInNotificationMixin);

  describe('views/mixins/signed-in-notification-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(SignedInNotificationMixin), 2);
      assert.isObject(SignedInNotificationMixin.notifications);
      assert.isFunction(SignedInNotificationMixin._navigateToSignedInView);
    });

    describe('new View', function () {
      var model;
      var notifier;
      var view;

      before(function () {
        model = new Backbone.Model();
        notifier = new Notifier();
        notifier.on = sinon.spy();
        view = new View({
          model: model,
          notifier: notifier
        });
      });

      after(function () {
        view.destroy();
      });

      it('calls notifier.on correctly', function () {
        assert.equal(notifier.on.callCount, 1);
        var args = notifier.on.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], notifier.COMMANDS.SIGNED_IN);
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
            setSignedInAccountByUid: sinon.spy(function () {
              return p();
            })
          };
          view.navigate = sinon.spy();
          notifier.triggerAll = sinon.spy();
          return notifier.on.args[0][1]({
            uid: 'uid'
          });
        });

        it('calls broker.hasCapability correctly', function () {
          assert.equal(view.broker.hasCapability.callCount, 1);
          assert.isTrue(view.broker.hasCapability.alwaysCalledOn(view.broker));
          var args = view.broker.hasCapability.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'handleSignedInNotification');
        });

        it('calls user.setSignedInAccountByUid correctly', function () {
          assert.equal(view.user.setSignedInAccountByUid.callCount, 1);
          assert.isTrue(view.user.setSignedInAccountByUid.alwaysCalledOn(view.user));
          assert.isTrue(view.user.setSignedInAccountByUid.calledWith('uid'));
        });

        it('calls navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          assert.isTrue(view.navigate.alwaysCalledOn(view));
          assert.isTrue(view.navigate.calledAfter(view.user.setSignedInAccountByUid));
          var args = view.navigate.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], 'settings');
        });

        it('does not call notifier.triggerAll', function () {
          assert.equal(notifier.triggerAll.callCount, 0);
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
            setSignedInAccountByUid: sinon.spy(function () {
              return p();
            })
          };
          view.navigate = sinon.spy();
          notifier.on.args[0][1]({
            uid: 'uid'
          });
        });

        it('calls broker.hasCapability', function () {
          assert.equal(view.broker.hasCapability.callCount, 1);
        });

        it('does not call user.setSignedInAccountByUid', function () {
          assert.isFalse(view.user.setSignedInAccountByUid.called);
        });

        it('does not call navigate', function () {
          assert.equal(view.navigate.callCount, 0);
        });
      });

      describe('navigateToSignedInView with OAuth redirect URL', function () {

        beforeEach(function () {
          view.broker = {
            hasCapability: sinon.spy(function () {
              return true;
            })
          };
          view.user = {
            setSignedInAccountByUid: sinon.spy(function () {
              return p();
            })
          };
          view.navigate = sinon.spy();
        });

        describe('without model.redirectTo', function () {
          beforeEach(function () {
            return notifier.on.args[0][1]({
              uid: 'uid'
            });
          });

          it('calls broker.hasCapability', function () {
            assert.equal(view.broker.hasCapability.callCount, 1);
          });

          it('calls user.setSignedInAccountByUid correctly', function () {
            assert.equal(view.user.setSignedInAccountByUid.callCount, 1);
            assert.isTrue(view.user.setSignedInAccountByUid.calledWith('uid'));
          });

          it('calls navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.args[0][0], 'settings');
          });
        });

        describe('with model.redirectTo', function () {
          beforeEach(function () {
            model.set('redirectTo', 'foo');
            return notifier.on.args[0][1]({
              uid: 'uid'
            });
          });

          it('calls navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            assert.equal(view.navigate.args[0][0], 'foo');
          });
        });
      });

      describe('destroy', function () {
        beforeEach(function () {
          notifier.off = sinon.spy();
          view.destroy();
        });

        it('calls notifier.off correctly', function () {
          assert.equal(notifier.off.callCount, 1);
          var args = notifier.off.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], notifier.COMMANDS.SIGNED_IN);
          assert.equal(args[1], notifier.on.args[0][1]);
        });
      });
    });
  });
});

