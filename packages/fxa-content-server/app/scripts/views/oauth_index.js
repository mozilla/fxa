/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect the user to the best suitable OAuth flow.
 * If email parameter is available, it will check to see if an
 * an account associated with it and navigate to signin/signup page.
 *
 * @module views/oauth_index
 */

import IndexView from './index';

class OAuthIndexView extends IndexView {
  afterRender() {
    return this.chooseEmailActionPage();
  }
}

export default OAuthIndexView;
