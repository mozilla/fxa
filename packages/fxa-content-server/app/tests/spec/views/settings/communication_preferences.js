/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import sinon from 'sinon';
import { SETTINGS_COMMUNICATION } from '../../../../../tests/functional/lib/selectors';
import View from 'views/settings/communication_preferences';
import WindowMock from '../../../mocks/window';

const Selectors = SETTINGS_COMMUNICATION;

describe('views/settings/communication_preferences', () => {
  let account;
  const marketingEmailPreferencesUrl = 'https://basket.allizom.org/fxa/';

  let view;
  let windowMock;

  function render() {
    return view.render().then(() => view.afterVisible());
  }

  beforeEach(() => {
    account = new Account({
      email: 'foo',
    });
    windowMock = new WindowMock();

    view = new View({
      config: {
        marketingEmailPreferencesUrl,
      },
      notifier: {
        trigger: sinon.spy(),
      },
      window: windowMock,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.stub(view, 'logFlowEvent').callsFake(() => {});

    return render();
  });

  afterEach(() => {
    $(view.el).remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    it('renders correctly', () => {
      return render().then(() => {
        const $manageEl = view.$(Selectors.BUTTON_MANAGE);
        assert.lengthOf($manageEl, 1);
        assert.include($manageEl.attr('href'), 'email=foo');
      });
    });
  });
});
