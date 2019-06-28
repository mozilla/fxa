/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import $ from 'jquery';
import { assert } from 'chai';
import KeyCodes from 'lib/key-codes';
import sinon from 'sinon';
import Tooltip from 'views/tooltip';
import WindowMock from '../../mocks/window';

function _createEvent(keyCode) {
  var keyEvent = $.Event('keydown');
  keyEvent.which = keyCode;

  return keyEvent;
}

describe('views/tooltip', function() {
  let tooltip;
  let windowMock;

  const htmlMessage = 'this is an <span>HTML tooltip</span>';

  beforeEach(function() {
    $('#container').html('<div class="input-row"><input id="focusMe" /></div>');
    windowMock = new WindowMock();

    tooltip = new Tooltip({
      invalidEl: '#focusMe',
      message: htmlMessage,
      window: windowMock,
    });
  });

  afterEach(function() {
    tooltip.destroy();
    $('#container').empty();
  });

  describe('render', function() {
    beforeEach(() => {
      return tooltip.render();
    });

    it('HTML escapes and renders and attaches the tooltip', function() {
      assert.equal(tooltip.$el.html(), _.escape(htmlMessage));
      assert.equal($('.tooltip').length, 1);
    });

    it('only one tooltip can be rendered at a time', function() {
      const tooltip2 = new Tooltip({
        invalidEl: '#focusMe',
        message: 'this is a second tooltip',
        window: windowMock,
      });

      return tooltip2.render().then(function() {
        assert.equal($('.tooltip').length, 1);
      });
    });

    describe('with `unsafeMessage`', () => {
      beforeEach(() => {
        $('#container').html(
          '<div class="input-row"><input id="focusMe" /></div>'
        );
        tooltip = new Tooltip({
          invalidEl: '#focusMe',
          unsafeMessage: htmlMessage,
          window: windowMock,
        });

        return tooltip.render();
      });

      it('renders the tooltip as HTML', () => {
        assert.equal(tooltip.$el.html(), htmlMessage);
        assert.equal($('.tooltip').length, 1);
      });
    });
  });

  describe('keyboard events', function() {
    it('does not close on down arrow key press', function() {
      return tooltip
        .render()
        .then(function() {
          $('#focusMe').trigger(_createEvent(KeyCodes.DOWN_ARROW));
        })
        .then(function() {
          assert.equal($('.tooltip').length, 1);
        });
    });

    it('does not close on left arrow key press', function() {
      return tooltip
        .render()
        .then(function() {
          $('#focusMe').trigger(_createEvent(KeyCodes.LEFT_ARROW));
        })
        .then(function() {
          assert.equal($('.tooltip').length, 1);
        });
    });

    it('does not close on right arrow key press', function() {
      return tooltip
        .render()
        .then(function() {
          $('#focusMe').trigger(_createEvent(KeyCodes.RIGHT_ARROW));
        })
        .then(function() {
          assert.equal($('.tooltip').length, 1);
        });
    });

    it('does not close on tab key press', function() {
      return tooltip
        .render()
        .then(function() {
          $('#focusMe').trigger(_createEvent(KeyCodes.TAB));
        })
        .then(function() {
          assert.equal($('.tooltip').length, 1);
        });
    });

    it('does not close on up arrow key press', function() {
      return tooltip
        .render()
        .then(function() {
          $('#focusMe').trigger(_createEvent(KeyCodes.UP_ARROW));
        })
        .then(function() {
          assert.equal($('.tooltip').length, 1);
        });
    });
  });

  describe('self destruct', function() {
    it('when invalid element is changed', function(done) {
      tooltip.once('destroyed', function() {
        done();
      });

      tooltip.render().then(function() {
        $('#focusMe').val('heyya!');
        $('#focusMe').trigger('keyup');
      });
    });

    it('when invalid element is not changed (should not destroy)', function() {
      return tooltip
        .render()
        .then(function() {
          $('#focusMe').trigger('keyup');
        })
        .then(function() {
          assert.equal($('.tooltip').length, 1);
        });
    });
  });

  describe('canShowTooltipBelow', () => {
    function setScreenSize(widthPx, heightPx) {
      windowMock.document.documentElement.clientHeight = heightPx;
      windowMock.document.documentElement.clientWidth = widthPx;
    }

    it('returns true if screen is large enough', () => {
      setScreenSize(520, 480);

      assert.isTrue(tooltip.canShowTooltipBelow());
    });

    it('returns false if screen is not wide enough', () => {
      setScreenSize(519, 480);

      assert.isFalse(tooltip.canShowTooltipBelow());
    });

    it('returns false if the screen is not tall enough', () => {
      setScreenSize(520, 479);

      assert.isFalse(tooltip.canShowTooltipBelow());
    });
  });

  describe('setPosition', () => {
    let invalidEl;
    let tooltipEl;

    beforeEach(() => {
      invalidEl = tooltip.invalidEl;
      tooltipEl = tooltip.$el;

      sinon.spy(invalidEl, 'css');
      sinon.stub(invalidEl, 'outerHeight').callsFake(() => 20);

      sinon.spy(tooltipEl, 'addClass');
      sinon.spy(tooltipEl, 'css');
      sinon.stub(tooltipEl, 'outerHeight').callsFake(() => 16);
    });

    it('does not allow tooltips on the bottom if `canShowTooltipBelow` returns false', () => {
      sinon.stub(tooltip, 'canShowTooltipBelow').callsFake(() => false);
      sinon
        .stub(invalidEl, 'hasClass')
        .callsFake(className => className === 'tooltip-below');

      tooltip.setPosition();

      assert.isTrue(invalidEl.hasClass.calledOnceWith('tooltip-below'));
      assert.isTrue(tooltip.canShowTooltipBelow.calledOnce);

      assert.isTrue(tooltipEl.css.calledOnceWith({ top: -18 }));
      assert.isTrue(tooltipEl.addClass.calledOnceWith('fade-down-tt'));
    });

    it('allows tooltips on the bottom if `canShowTooltipBelow` returns false', () => {
      sinon.stub(tooltip, 'canShowTooltipBelow').callsFake(() => true);
      sinon
        .stub(invalidEl, 'hasClass')
        .callsFake(className => className === 'tooltip-below');

      tooltip.setPosition();

      assert.isTrue(invalidEl.hasClass.calledOnceWith('tooltip-below'));
      assert.isTrue(tooltip.canShowTooltipBelow.calledOnce);

      assert.isTrue(tooltipEl.css.calledOnceWith({ top: 24 }));
      assert.isTrue(
        tooltipEl.addClass.calledOnceWith('tooltip-below fade-up-tt')
      );
    });

    it('shows tooltips on top by default', () => {
      sinon.stub(tooltip, 'canShowTooltipBelow').callsFake(() => true);
      sinon.stub(invalidEl, 'hasClass').callsFake(() => false);

      tooltip.setPosition();

      assert.isTrue(tooltipEl.css.calledOnceWith({ top: -18 }));
      assert.isTrue(tooltipEl.addClass.calledOnceWith('fade-down-tt'));
    });
  });
});
