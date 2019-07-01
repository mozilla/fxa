/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import chai from 'chai';
import Cocktail from 'cocktail';
import FormView from 'views/form';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import SettingsPanelMixin from 'views/mixins/settings-panel-mixin';
import sinon from 'sinon';
import TestTemplate from 'templates/test_template.mustache';

var assert = chai.assert;

var SettingsPanelView = FormView.extend({
  template: TestTemplate,
});

Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);

describe('views/mixins/settings-panel-mixin', function() {
  var view;
  var metrics;
  var notifier;

  beforeEach(function() {
    notifier = new Notifier();
    metrics = new Metrics({ notifier });

    view = new SettingsPanelView({
      metrics: metrics,
      notifier,
      parentView: {
        $: $,
        displaySuccess: sinon.spy(),
      },
    });

    return view.render().then(function() {
      $('#container').html(view.el);
    });
  });

  afterEach(function() {
    metrics.destroy();

    view.remove();
    view.destroy();

    view = metrics = null;
  });

  describe('autofocus elements', () => {
    it('are converted to [data-autofocus-on-panel-open] to prevent attempts at autofocusing hidden elements', () => {
      assert.lengthOf(view.$('[autofocus]'), 0);
      assert.lengthOf(view.$('[data-autofocus-on-panel-open]'), 1);
    });
  });

  describe('events', function() {
    it('toggles button', function() {
      sinon.stub(view, 'navigate').callsFake(function() {});
      $('.settings-unit-toggle').click();
      assert.isTrue(view.navigate.calledWith('settings/display_name'));
    });

    it('toggles open and closed', function() {
      sinon.stub(view, 'closePanel').callsFake(function() {});
      sinon.stub(view, 'clearInput').callsFake(function() {});
      sinon.stub(view, 'navigate').callsFake(function() {});
      $('button.cancel').click();
      assert.isTrue(view.closePanel.called);
      assert.isTrue(view.clearInput.called);
      assert.isTrue(view.navigate.calledWith('settings'));
    });
  });

  describe('methods', function() {
    it('open and close', function() {
      view.openPanel();
      assert.isTrue($('.settings-unit').hasClass('open'));
      assert.isTrue(view.isPanelOpen());
      view.closePanel();
      assert.isFalse($('.settings-unit').hasClass('open'));
      assert.isFalse(view.isPanelOpen());
    });

    it('openPanel focuses the first autofocus element if present', function() {
      // create and append an input field
      var $dummyInput = $(
        '<input type="text" name="dummyholder" data-autofocus-on-panel-open>'
      );
      view.$('.settings-unit').append($dummyInput);
      // make sure that it is a non-touch device
      $('html').addClass('no-touch');
      view.openPanel();

      // input field should be present, we just appended it
      var $autofocusEl = view.$('.open [data-autofocus-on-panel-open]');
      assert.lengthOf($autofocusEl, 1);
      // autofocusEl should have been focused
      assert.equal(
        $autofocusEl[0],
        document.activeElement,
        'autofocus element has focus'
      );
    });

    it('hidePanel hides the open panel', function() {
      sinon.stub(view, 'closePanel').callsFake(function() {});
      sinon.stub(view, 'navigate').callsFake(function() {});
      view.openPanel();
      view.hidePanel();
      assert.isTrue(view.closePanel.called);
      assert.isTrue(view.navigate.calledWith('settings'));
    });

    it('displaySuccess', function() {
      sinon.stub(view, 'closePanel').callsFake(function() {});
      view.displaySuccess('hi');
      assert.isTrue(view.parentView.displaySuccess.calledWith('hi'));
      assert.isTrue(view.closePanel.called);
    });
  });
});
