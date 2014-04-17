/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/tooltip'
],
function (chai, $, Tooltip) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/tooltip', function () {
    var tooltip;

    beforeEach(function () {
      $('#container').html('<div class="input-row"><input id="focusMe" /></div>');

      tooltip = new Tooltip({
        message: 'this is a tooltip',
        invalidEl: '#focusMe'
      });
    });

    afterEach(function () {
      tooltip.destroy();
      $('#container').empty();
    });

    describe('render', function () {
      it('renders and attaches the tooltip', function () {
        return tooltip.render()
            .then(function () {
              assert.equal(tooltip.$el.text(), 'this is a tooltip');
              assert.equal($('.tooltip').length, 1);
            });
      });

      it('only one tooltip can be rendered at a time', function () {
        var tooltip2 = new Tooltip({
          message: 'this is a second tooltip',
          invalidEl: '#focusMe'
        });

        return tooltip.render()
            .then(function () {
              return tooltip2.render();
            })
            .then(function () {
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
          $('#focusMe').trigger('keydown');
        });
      });
    });
  });
});


