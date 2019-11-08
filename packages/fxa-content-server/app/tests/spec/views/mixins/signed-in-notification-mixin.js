/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Backbone from 'backbone';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import SignedInNotificationMixin from 'views/mixins/signed-in-notification-mixin';
import sinon from 'sinon';

const View = BaseView.extend({});
Cocktail.mixin(View, SignedInNotificationMixin);

describe('views/mixins/signed-in-notification-mixin', () => {
  it('exports correct interface', () => {
    assert.lengthOf(Object.keys(SignedInNotificationMixin), 2);
    assert.isObject(SignedInNotificationMixin.notifications);
    assert.isFunction(SignedInNotificationMixin._navigateToSignedInView);
  });

  describe('new View', () => {
    let notifier;
    let relier;
    let view;

    before(() => {
      notifier = new Notifier();
      notifier.on = sinon.spy();
      relier = new Backbone.Model();
      view = new View({
        notifier,
        relier,
      });
    });

    after(() => {
      view.destroy();
      view = null;
    });

    it('has the expected notifications', () => {
      assert.lengthOf(Object.keys(view.notifications), 1);
      assert.isTrue(notifier.COMMANDS.SIGNED_IN in view.notifications);
    });

    describe('navigateToSignedInView', () => {
      before(() => {
        view.broker = {
          hasCapability: sinon.spy(() => {
            return true;
          }),
        };
        view.user = {
          setSignedInAccountByUid: sinon.spy(() => {
            return Promise.resolve();
          }),
        };
        view.navigate = sinon.spy();
        notifier.triggerAll = sinon.spy();
        return notifier.on.args[0][1]({
          uid: 'uid',
        });
      });

      it('calls broker.hasCapability correctly', () => {
        assert.equal(view.broker.hasCapability.callCount, 1);
        assert.isTrue(view.broker.hasCapability.alwaysCalledOn(view.broker));
        const args = view.broker.hasCapability.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'handleSignedInNotification');
      });

      it('calls user.setSignedInAccountByUid correctly', () => {
        assert.equal(view.user.setSignedInAccountByUid.callCount, 1);
        assert.isTrue(
          view.user.setSignedInAccountByUid.alwaysCalledOn(view.user)
        );
        assert.isTrue(view.user.setSignedInAccountByUid.calledWith('uid'));
      });

      it('calls navigate correctly', () => {
        assert.equal(view.navigate.callCount, 1);
        assert.isTrue(view.navigate.alwaysCalledOn(view));
        assert.isTrue(
          view.navigate.calledAfter(view.user.setSignedInAccountByUid)
        );
        const args = view.navigate.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'settings');
      });

      it('does not call notifier.triggerAll', () => {
        assert.equal(notifier.triggerAll.callCount, 0);
      });
    });

    describe('navigateToSignedInView without handleSignedInNotification capability', () => {
      before(() => {
        view.broker = {
          hasCapability: sinon.spy(() => {
            return false;
          }),
        };
        view.user = {
          setSignedInAccountByUid: sinon.spy(() => {
            return Promise.resolve();
          }),
        };
        view.navigate = sinon.spy();
        notifier.on.args[0][1]({
          uid: 'uid',
        });
      });

      it('calls broker.hasCapability', () => {
        assert.equal(view.broker.hasCapability.callCount, 1);
      });

      it('does not call user.setSignedInAccountByUid', () => {
        assert.isFalse(view.user.setSignedInAccountByUid.called);
      });

      it('does not call navigate', () => {
        assert.equal(view.navigate.callCount, 0);
      });
    });

    describe('navigateToSignedInView with OAuth redirect URL', () => {
      beforeEach(() => {
        view.broker = {
          hasCapability: sinon.spy(() => {
            return true;
          }),
        };
        view.user = {
          setSignedInAccountByUid: sinon.spy(() => {
            return Promise.resolve();
          }),
        };
        view.navigate = sinon.spy();
      });

      describe('without relier.redirectTo', () => {
        beforeEach(() => {
          return notifier.on.args[0][1]({
            uid: 'uid',
          });
        });

        it('calls broker.hasCapability', () => {
          assert.equal(view.broker.hasCapability.callCount, 1);
        });

        it('calls user.setSignedInAccountByUid correctly', () => {
          assert.equal(view.user.setSignedInAccountByUid.callCount, 1);
          assert.isTrue(view.user.setSignedInAccountByUid.calledWith('uid'));
        });

        it('calls navigate correctly', () => {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.args[0][0], 'settings');
        });
      });

      describe('with relier.redirectTo', () => {
        beforeEach(() => {
          relier.set('redirectTo', 'foo');
          return notifier.on.args[0][1]({
            uid: 'uid',
          });
        });

        it('calls navigate correctly', () => {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.args[0][0], 'foo');
        });
      });
    });
  });
});
