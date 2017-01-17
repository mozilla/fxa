/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const sinon = require('sinon');
  const View = require('views/why_connect_another_device');

  describe('views/why_connect_another_device', () => {
    let view;

    beforeEach(() => {
      view = new View({});
    });

    afterEach(() => {
      view.destroy();
    });

    it('render opens the panel', () => {
      sinon.spy(view, 'openPanel');

      return view.render()
        .then(() => {
          assert.isTrue(view.openPanel.calledOnce);
        });
    });

    describe('click handlers', () => {
      beforeEach(() => {
        sinon.stub(view, 'navigate', () => {});

        return view.render();
      });

      it('a click on the button returns to `connect_another_device`', () => {
        view.$el.find('button[type=submit]').click();
        assert.isTrue(view.navigate.calledOnce);
        assert.isTrue(view.navigate.calledWith('connect_another_device'));
      });

      it('a click on the background returns to `connect_another_device`', () => {
        view.trigger('modal-cancel');
        assert.isTrue(view.navigate.calledOnce);
        assert.isTrue(view.navigate.calledWith('connect_another_device'));
      });
    });
  });
});
