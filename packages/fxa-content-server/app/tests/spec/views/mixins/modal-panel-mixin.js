define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const ModalPanelMixin = require('views/mixins/modal-panel-mixin');
  const Notifier = require('lib/channels/notifier');
  const sinon = require('sinon');
  const TestTemplate = require('stache!templates/test_template');

  const ModalPanelView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(
    ModalPanelView,
    ModalPanelMixin
  );

  describe('views/mixins/modal-panel-mixin', function () {
    let notifier;
    let view;

    beforeEach(function () {
      notifier = new Notifier();
      view = new ModalPanelView({
        notifier
      });

      return view.render();
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      view = null;
    });


    it('open and close', function () {
      view.openPanel();
      assert.isTrue($.modal.isActive());

      view.closePanel();
      assert.isFalse($.modal.isActive());
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
});
