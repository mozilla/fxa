/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const TestTemplate = require('stache!templates/test_template');

  const ModalSettingsPanelView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(
    ModalSettingsPanelView,
    ModalSettingsPanelMixin
  );

  describe('views/mixins/modal-settings-panel-mixin', function () {
    let notifier;
    let view;

    beforeEach(function () {
      notifier = new Notifier();

      view = new ModalSettingsPanelView({
        notifier,
        parentView: {
          displaySuccess: sinon.spy()
        },
      });

      return view.render();
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      view = null;
    });

    describe('events', () => {
      beforeEach(() => {
        $('#container').html(view.$el);
      });

      it('cancel button click navigates to settings', function () {
        sinon.stub(view, 'navigate').callsFake(() => {});
        $('button.cancel').click();
        assert.isTrue(view.navigate.calledWith('settings'));
      });

      it('back button click navigates to settings/avatar/change', function () {
        sinon.stub(view, 'navigate').callsFake(function () { });
        $('.modal-panel #back').click();
        assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
      });
    });

    it('displaySuccess delegates to the parent view', function () {
      view.displaySuccess('hi');
      assert.isTrue(view.parentView.displaySuccess.calledWith('hi'));
    });

    describe('modal-cancel event', () => {
      beforeEach(() => {
        sinon.stub(view, 'navigate').callsFake(function () {
          this._hasNavigated = true;
        });
      });

      describe('cancel from clients disconnect modal navigates to /settings/clients', () => {
        it('navigates to /settings/clients', () => {
          view.currentPage = 'settings/clients/disconnect';
          view.trigger('modal-cancel');
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('settings/clients'));
        });
      });

      describe('cancel from other modal navigates to /settings', () => {
        it('does not navigate to settings', () => {
          view.currentPage = 'settings/avatar/change';
          view.trigger('modal-cancel');
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('settings'));
        });
      });
    });
  });
});
