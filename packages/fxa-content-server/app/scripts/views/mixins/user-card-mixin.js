/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AvatarMixin from './avatar-mixin';
import UserCardTemplate from 'templates/partial/user-card.mustache';

export default {
  dependsOn: [AvatarMixin],

  initialize(options) {
    // Both this.displayAccountProfileImage and signing in with cached
    // credentials could cause the existing accessToken to be invalidated.
    // When this happens, re-render the view.
    const account = this.getAccount();

    this.listenTo(account, 'change:accessToken', () => {
      if (!account.get('accessToken')) {
        return this.rerender();
      }
    });
  },

  afterVisible() {
    const account = this.getAccount();
    return this.displayAccountProfileImage(account);
  },

  setInitialContext(context) {
    context.set({
      userCardHTML: this.renderTemplate(UserCardTemplate, {
        email: this.getAccount().get('email'),
      }),
    });
  },
};
