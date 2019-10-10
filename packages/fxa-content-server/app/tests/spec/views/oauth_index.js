/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import OAuthIndexView from 'views/oauth_index';
import sinon from 'sinon';

describe('views/oauth_index', () => {
  let view;

  beforeEach(() => {
    view = new OAuthIndexView({});

    sinon.spy(view, 'replaceCurrentPage');
  });

  it('calls chooseEmailActionPage', () => {
    sinon
      .stub(view, 'chooseEmailActionPage')
      .callsFake(() => Promise.resolve());

    return view.afterRender().then(() => {
      assert.isTrue(view.chooseEmailActionPage.calledOnce);
    });
  });
});
