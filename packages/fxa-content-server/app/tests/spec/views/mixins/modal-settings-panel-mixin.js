/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import ModalSettingsPanelMixin from 'views/mixins/modal-settings-panel-mixin';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import TestTemplate from 'templates/test_template.mustache';

const ModalSettingsPanelView = BaseView.extend({
  template: TestTemplate,
});

Cocktail.mixin(ModalSettingsPanelView, ModalSettingsPanelMixin);

describe('views/mixins/modal-settings-panel-mixin', () => {
  let notifier;
  let view;

  beforeEach(() => {
    notifier = new Notifier();

    view = new ModalSettingsPanelView({
      notifier,
      parentView: {
        displaySuccess: sinon.spy(),
      },
    });

    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;
  });

  describe('events', () => {
    beforeEach(() => {
      $('#container').html(view.$el);
    });

    it('cancel button click navigates to settings', () => {
      sinon.stub(view, 'navigate').callsFake(() => {});
      // there are two button.cancel's in the DOM, only click the first or else
      // two navigate calls are made.
      $('button.cancel:nth(0)').click();
      assert.isTrue(view.navigate.calledOnceWith('settings'));
    });

    it('back button click navigates to settings/avatar/change', () => {
      sinon.stub(view, 'navigate').callsFake(() => {});
      $('.modal-panel #back').click();
      assert.isTrue(view.navigate.calledOnceWith('settings/avatar/change'));
    });
  });

  it('displaySuccess delegates to the parent view', () => {
    view.displaySuccess('hi');
    assert.isTrue(view.parentView.displaySuccess.calledOnceWith('hi'));
  });

  describe('modal-cancel event', () => {
    beforeEach(() => {
      sinon.stub(view, 'navigate').callsFake(function() {
        this._hasNavigated = true;
      });
    });

    describe('cancel from clients disconnect modal navigates to /settings/clients', () => {
      it('navigates to /settings/clients', () => {
        view.currentPage = 'settings/clients/disconnect';
        view.trigger('modal-cancel');
        assert.isTrue(view.navigate.calledOnceWith('settings/clients'));
      });
    });

    describe('cancel from other modal navigates to /settings', () => {
      it('does not navigate to settings', () => {
        view.currentPage = 'settings/avatar/change';
        view.trigger('modal-cancel');
        assert.isTrue(view.navigate.calledOnceWith('settings'));
      });
    });

    it('modal-cancel event is ignored if a navigate occurs', () => {
      view.navigate('settings');
      view.currentPage = 'settings/clients/disconnect';
      view.trigger('modal-cancel');
      assert.isTrue(view.navigate.calledOnceWith('settings'));
    });
  });
});
