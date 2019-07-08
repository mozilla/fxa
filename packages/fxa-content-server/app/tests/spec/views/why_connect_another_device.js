/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import View from 'views/why_connect_another_device';

describe('views/why_connect_another_device', () => {
  let notifier;
  let view;

  beforeEach(() => {
    notifier = new Notifier();

    view = new View({
      canGoBack: true,
      notifier,
    });
  });

  afterEach(() => {
    view.destroy();
  });

  it('render opens the panel', () => {
    sinon.spy(view, 'openPanel');

    return view.render().then(() => {
      assert.isTrue(view.openPanel.calledOnce);
    });
  });

  describe('going back', () => {
    beforeEach(() => {
      sinon.spy(view, 'back');

      return view.render().then(() => {
        $('#container').html(view.el);
      });
    });

    it('a click on the button navigates `back`', () => {
      view.$el.find('button[type="submit"]').click();
      assert.isTrue(view.back.called);
    });

    it('`modal-cancel` event navigates `back`', () => {
      view.trigger('modal-cancel');
      // the 2nd notification should be ignored.
      view.trigger('modal-cancel');
      assert.isTrue(view.back.calledOnce);
    });
  });
});
