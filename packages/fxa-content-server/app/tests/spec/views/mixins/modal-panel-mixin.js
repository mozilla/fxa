/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import ModalPanelMixin from 'views/mixins/modal-panel-mixin';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import TestTemplate from 'templates/test_template.mustache';

const ModalPanelView = BaseView.extend({
  template: TestTemplate,
});

Cocktail.mixin(ModalPanelView, ModalPanelMixin);

describe('views/mixins/modal-panel-mixin', () => {
  let notifier;
  let view;

  beforeEach(() => {
    notifier = new Notifier();
    view = new ModalPanelView({
      notifier,
    });

    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;
  });

  describe('open and close', () => {
    it('does the right thing', () => {
      assert.equal($('body').css('min-height'), '0px');
      view.openPanel();
      assert.isTrue($.modal.isActive());
      assert.equal($('body').css('min-height'), '0px');

      view.closePanel();
      assert.isFalse($.modal.isActive());
      assert.equal($('body').css('min-height'), '0px');
    });
  });

  it('closePanel destroys the view', () => {
    sinon.spy(view, 'destroy');
    view.openPanel();
    view.closePanel();

    assert.isTrue(view.destroy.calledOnce);
  });

  describe('click handler', () => {
    beforeEach(() => {
      $('#container').html(view.$el);

      sinon.spy(view, 'trigger');
      sinon.spy(view, 'closePanel');

      view.openPanel();
    });

    it('click on the blocker background closes the panel, triggers `modal-cancel`', () => {
      $('.blocker').click();

      assert.isTrue(view.trigger.called);
      assert.isTrue(view.trigger.calledWith('modal-cancel'));
      assert.isTrue(view.closePanel.calledTwice); // called in onBlockerClick then in destroy
    });

    it('click on a child of the blocker has no effect', () => {
      $('#back').click();

      assert.isFalse(view.trigger.called);
      assert.isFalse(view.closePanel.called);
    });
  });

  describe('notifications', () => {
    function testNotificationClosesPanel(notification) {
      it(`${notification} closes the panel`, () => {
        sinon.spy(view, 'closePanel');
        notifier.trigger(notification);

        assert.isTrue(view.closePanel.calledOnce);
      });
    }

    testNotificationClosesPanel('navigate');
    testNotificationClosesPanel('navigate-back');
  });
});
