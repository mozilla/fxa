/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const $ = require('jquery');
  const { assert } = require('chai');
  const KeyCodes = require('lib/key-codes');
  const Tooltip = require('views/tooltip');

  function _createEvent(keyCode) {
    var keyEvent = $.Event('keydown');
    keyEvent.which = keyCode;

    return keyEvent;
  }

  describe('views/tooltip', function () {
    let tooltip;
    const htmlMessage = 'this is an <span>HTML tooltip</span>';

    beforeEach(function () {
      $('#container').html('<div class="input-row"><input id="focusMe" /></div>');
      tooltip = new Tooltip({
        invalidEl: '#focusMe',
        message: htmlMessage
      });
    });

    afterEach(function () {
      tooltip.destroy();
      $('#container').empty();
    });

    describe('render', function () {
      beforeEach(() => {
        return tooltip.render();
      });

      it('HTML escapes and renders and attaches the tooltip', function () {
        assert.equal(tooltip.$el.html(), _.escape(htmlMessage));
        assert.equal($('.tooltip').length, 1);
      });

      it('only one tooltip can be rendered at a time', function () {
        const tooltip2 = new Tooltip({
          invalidEl: '#focusMe',
          message: 'this is a second tooltip'
        });

        return tooltip2.render()
          .then(function () {
            assert.equal($('.tooltip').length, 1);
          });
      });


      describe('with `unsafeMessage`', () => {
        beforeEach(() => {
          $('#container').html('<div class="input-row"><input id="focusMe" /></div>');
          tooltip = new Tooltip({
            invalidEl: '#focusMe',
            unsafeMessage: htmlMessage
          });

          return tooltip.render();
        });

        it('renders the tooltip as HTML', () => {
          assert.equal(tooltip.$el.html(), htmlMessage);
          assert.equal($('.tooltip').length, 1);
        });
      });
    });

    describe('keyboard events', function () {
      it('does not close on down arrow key press', function () {
        return tooltip.render().then(function () {
          $('#focusMe').trigger(_createEvent(KeyCodes.DOWN_ARROW));
        }).then(function () {
          assert.equal($('.tooltip').length, 1);
        });
      });

      it('does not close on left arrow key press', function () {
        return tooltip.render().then(function () {
          $('#focusMe').trigger(_createEvent(KeyCodes.LEFT_ARROW));
        }).then(function () {
          assert.equal($('.tooltip').length, 1);
        });
      });

      it('does not close on right arrow key press', function () {
        return tooltip.render().then(function () {
          $('#focusMe').trigger(_createEvent(KeyCodes.RIGHT_ARROW));
        }).then(function () {
          assert.equal($('.tooltip').length, 1);
        });
      });

      it('does not close on tab key press', function () {
        return tooltip.render().then(function () {
          $('#focusMe').trigger(_createEvent(KeyCodes.TAB));
        }).then(function () {
          assert.equal($('.tooltip').length, 1);
        });
      });

      it('does not close on up arrow key press', function () {
        return tooltip.render().then(function () {
          $('#focusMe').trigger(_createEvent(KeyCodes.UP_ARROW));
        }).then(function () {
          assert.equal($('.tooltip').length, 1);
        });
      });
    });

    describe('self destruct', function () {
      it('when invalid element is changed', function (done) {
        tooltip.once('destroyed', function () {
          done();
        });

        tooltip.render().then(function () {
          $('#focusMe').val('heyya!');
          $('#focusMe').trigger('keyup');
        });
      });

      it('when invalid element is not changed (should not destroy)', function () {
        return tooltip.render().then(function () {
          $('#focusMe').trigger('keyup');
        }).then(function () {
          assert.equal($('.tooltip').length, 1);
        });
      });
    });
  });
});
