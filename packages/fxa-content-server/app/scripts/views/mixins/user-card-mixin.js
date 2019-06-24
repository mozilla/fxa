/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AvatarMixin from './avatar-mixin';
import UserCardTemplate from 'templates/partial/user-card.mustache';

export default {
  dependsOn: [AvatarMixin],

  afterVisible() {
    // this.displayAccountProfileImage could cause the existing
    // accessToken to be invalidated, in which case the view
    // should be re-rendered with the default avatar.
    const account = this.getAccount();
    this.listenTo(account, 'change:accessToken', () =>
      this._onAccessTokenChange()
    );
    return this.displayAccountProfileImage(account, { spinner: true });
  },

  setInitialContext(context) {
    context.set({
      userCardHTML: this.renderTemplate(UserCardTemplate, {
        email: this.getAccount().get('email'),
      }),
    });
  },

  _onAccessTokenChange() {
    // if no access token and password is not visible we need to show the password field.
    if (!this.getAccount().has('accessToken')) {
      // accessToken could be changed async by an external request after render
      // If the ProfileClient fails to get an OAuth token with the current token then reset the view
      this.setDefaultPlaceholderAvatar();
    }
  },
};
