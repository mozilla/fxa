/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import LastCheckedTimeMixin from 'views/mixins/last-checked-time-mixin';
import sinon from 'sinon';

const View = BaseView.extend({});

Cocktail.mixin(View, LastCheckedTimeMixin);

describe('views/mixins/last-checked-time-mixin', () => {
  let view;

  beforeEach(() => {
    view = new View({});
  });

  it('should set last checked time', () => {
    assert.equal(view.lastCheckedTime, undefined, 'no time set');
    view.setLastCheckedTime();
    assert.equal(typeof view.lastCheckedTime, 'string', 'time is set');
  });

  it('should return `none` if lastCheckTime is not set', () => {
    assert.equal(view.lastCheckedTime, undefined, 'no time set');
    const lastCheckString = view.getLastCheckedTimeString();
    assert.equal(
      lastCheckString,
      'Last checked: none',
      'time is set to `none`'
    );
  });

  it('should return formatted time', () => {
    const date = new Date();
    sinon.stub(date, 'toLocaleTimeString').callsFake(() => '4:58 PM');
    view.setLastCheckedTime(date);
    const lastCheckString = view.getLastCheckedTimeString();
    assert.equal(
      lastCheckString,
      'Last checked: 4:58 PM',
      'formatted time is set'
    );
  });
});
