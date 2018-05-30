/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * OAuth authorization view, redirects based on requested OAuth actions.
 */
import BaseView from './base';

class AuthorizationView extends BaseView {
  beforeRender () {
    const action = this.relier.get('action');
    if (action) {
      const pathname = action === 'email' ? '/' : action;
      this.replaceCurrentPage(this.broker.transformLink(pathname));
    } else {
      this.replaceCurrentPage('/oauth/signup');
    }
  }
}

module.exports = AuthorizationView;
