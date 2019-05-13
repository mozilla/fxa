/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin to display the signup breadcrumb UI.
 * See https://github.com/mozilla/fxa/issues/1084
 */

import Template from 'templates/partial/create-account-breadcrumb.mustache';

export const CREATE_ACCOUNT = 'isCreateActive';
export const CHOOSE_WHAT_TO_SYNC = 'isChooseSetupActive';
export const CONFIRM = 'isConfirmActive';
export const CONNECT_ANOTHER_DEVICE = 'isConnectDeviceActive';
export const SEND_TAB = 'isSendFirstTabActive';

export default function (config = {}) {
  return {
    isBreadcrumbEnabled () {
      // If the isSignUp method is not available, assume feature is enabled.
      // If the isSignUp method is available, only show if actually signing up.
      return ! this.isSignUp || this.isSignUp();
    },

    afterRender () {
      if (this.isBreadcrumbEnabled()) {
        const breadcrumbHtml = this.renderTemplate(Template, {
          [config.active]: true
        });

        this.$el.find('section').after(breadcrumbHtml);
      }
    },
  };
}
