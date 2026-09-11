/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

/**
 * The consent screen an untrusted relying party shows before the grant
 * completes. Identified by route, and by test ids the component's unit test
 * guards, because the heading names the relying party and the CMS can override
 * relying-party copy.
 */
export class PermissionsPage extends BaseLayout {
  readonly path = 'signin_permissions';

  get continueButton() {
    return this.page.getByTestId('permissions-continue-button');
  }

  get cancelButton() {
    return this.page.getByTestId('permissions-cancel-button');
  }

  get scopeRows() {
    return this.page.getByTestId('permissions-list').getByRole('listitem');
  }

  /** `profile:email` becomes `permissions-row-profile-email`. */
  scopeRow(scope: string) {
    return this.page.getByTestId(`permissions-row-${scope.replace(/:/g, '-')}`);
  }

  /**
   * The screen arrives by an async navigation, and checkPath() reads the URL
   * without retrying, so wait for the page to render before asserting it.
   */
  async waitForPage() {
    await this.continueButton.waitFor();
    this.checkPath();
  }
}
