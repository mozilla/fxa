/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import { Model } from 'backbone';
import sinon from 'sinon';
import View from 'views/sign_in_bounced';
import template from 'templates/sign_in_bounced.mustache';

describe('views/sign_in_bounced', () => {
  let clickHandler, formPrefill, model, user, view;

  beforeEach(() => {
    formPrefill = {
      clear: sinon.spy(),
    };
    model = new Model();
    model.set('email', 'foo@example.com');
    user = {
      removeAllAccounts: sinon.spy(),
    };
    view = new View({ formPrefill, model, user });
    clickHandler = view.events['click #create-account'];
    sinon.spy(view, 'setInitialContext');
  });

  it('set properties correctly', () => {
    assert.isFunction(clickHandler);
    assert.strictEqual(view.template, template);
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      view.navigate = sinon.spy();
      view.beforeRender();
    });

    it('did not call navigate', () => {
      assert.equal(view.navigate.callCount, 0);
    });
  });

  describe("beforeRender, this.model.has('email') === false", () => {
    beforeEach(() => {
      model.unset('email');
      view.navigate = sinon.spy();
      view.beforeRender();
    });

    it('called navigate correctly', () => {
      assert.equal(view.navigate.callCount, 1);
      assert.lengthOf(view.navigate.args[0], 1);
      assert.equal(view.navigate.args[0][0], 'signin');
    });
  });

  describe('setInitialContext', () => {
    let context;

    beforeEach(() => {
      context = {
        has: sinon.spy(),
        set: sinon.spy(),
      };
      view.setInitialContext(context);
    });

    it('called context.has correctly', () => {
      assert.equal(context.has.callCount, 1);
      assert.lengthOf(context.has.args[0], 1);
      assert.equal(context.has.args[0][0], 'canGoBack');
    });

    it('called context.set correctly', () => {
      assert.equal(context.set.callCount, 2);

      assert.lengthOf(context.set.args[0], 1);
      assert.deepEqual(context.set.args[0][0], {
        email: 'foo@example.com',
        escapedSupportLinkAttrs:
          'id="support" href="https://support.mozilla.org/" target="_blank" data-flow-event="link.support"',
      });

      assert.lengthOf(context.set.args[1], 2);
      assert.equal(context.set.args[1][0], 'canGoBack');
    });
  });

  describe('click handler', () => {
    let event;

    beforeEach(() => {
      event = {
        preventDefault: sinon.spy(),
      };
      view.navigate = sinon.spy();
      clickHandler.call(view, event);
    });

    it('called event.preventDefault correctly', () => {
      assert.equal(event.preventDefault.callCount, 1);
      assert.lengthOf(event.preventDefault.args[0], 0);
    });

    it('called user.removeAllAccounts correctly', () => {
      assert.equal(user.removeAllAccounts.callCount, 1);
      assert.lengthOf(user.removeAllAccounts.args[0], 0);
    });

    it('called formPrefill.clear correctly', () => {
      assert.equal(formPrefill.clear.callCount, 1);
      assert.lengthOf(formPrefill.clear.args[0], 0);
    });

    it('called view.navigate correctly', () => {
      assert.equal(view.navigate.callCount, 1);
      assert.lengthOf(view.navigate.args[0], 1);
      assert.equal(view.navigate.args[0][0], 'signup');
    });
  });
});
