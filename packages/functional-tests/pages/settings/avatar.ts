/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SettingsLayout } from './layout';

export class AvatarPage extends SettingsLayout {
  readonly path = 'settings/avatar';

  get profilePictureHeading() {
    return this.page.getByRole('heading', { name: 'Profile picture' });
  }

  get photo() {
    return this.page
      .getByTestId('flow-container')
      .getByTestId('avatar-nondefault');
  }

  get addPhotoButton() {
    return this.page.getByRole('button', { name: 'Add photo' });
  }

  get removePhotoButton() {
    return this.page.getByRole('button', { name: 'Remove photo' });
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async addPhoto(path: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.addPhotoButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path);
  }
}
