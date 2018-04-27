/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {assert} = require('chai');
const Backbone = require('backbone');
const BaseView = require('views/base');
const Cocktail = require('cocktail');
const Notifier = require('lib/channels/notifier');
const SessionVerifiedNotificationMixin = require('views/mixins/session-verified-notification-mixin');
const sinon = require('sinon');

const View = BaseView.extend({});
Cocktail.mixin(View, SessionVerifiedNotificationMixin);

describe('views/mixins/session-verified-notification-mixin', () => {
  it('exports correct interface', () => {
    assert.lengthOf(Object.keys(SessionVerifiedNotificationMixin), 2);
    assert.isObject(SessionVerifiedNotificationMixin.notifications);
    assert.isFunction(SessionVerifiedNotificationMixin._render);
  });

  describe('new View', () => {
    let model;
    let notifier;
    let view;

    before(() => {
      model = new Backbone.Model();
      notifier = new Notifier();
      notifier.on = sinon.spy();
      view = new View({
        model: model,
        notifier: notifier
      });
    });

    after(() => {
      view.destroy();
      view = null;
    });

    it('has the expected notifications', () => {
      assert.lengthOf(Object.keys(view.notifications), 1);
      assert.isTrue(notifier.COMMANDS.SESSION_VERIFIED in view.notifications);
    });

    describe('_render', () => {
      before(() => {
        view.render = sinon.spy();
        notifier.triggerAll = sinon.spy();
        return notifier.on.args[0][1]();
      });

      it('calls render correctly', () => {
        assert.equal(view.render.callCount, 1);
      });
    });
  });
});

