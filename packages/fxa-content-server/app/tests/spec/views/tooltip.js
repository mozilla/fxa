/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'jquery',
  'views/tooltip'
],
function (mocha, chai, $, Tooltip) {
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
        tooltip.render();
        assert.equal(tooltip.$el.text(), 'this is a tooltip');
        assert.equal($('.tooltip').length, 1);
      });

      it('only one tooltip can be rendered at a time', function () {
        tooltip.render();

        var tooltip2 = new Tooltip({
          message: 'this is a second tooltip',
          invalidEl: '#focusMe'
        });
        tooltip2.render();
        assert.equal($('.tooltip').length, 1);
      });
    });

    describe('self destructs', function () {
      it('when invalid element is changed', function (done) {
        tooltip.render();
        tooltip.once('destroyed', function () {
          done();
        });

        $('#focusMe').trigger('keydown');
      });
    });
  });
});


