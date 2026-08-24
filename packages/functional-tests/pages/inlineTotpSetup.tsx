/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class InlineTotpSetupPage extends BaseLayout {
  readonly path = '/inline_totp_setup';

  get introHeading() {
    return this.page.getByRole('heading', {
      name: 'Set up two-step authentication',
    });
  }

  // Structural, not copy — the banner id is guarded in the FlowSetup2faPrompt
  // unit test, which is also where the wording is asserted.
  get passkeySuccessBanner() {
    return this.page.locator('#passkey-signin-success');
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get mfaGuardHeading() {
    return this.page.getByRole('heading', { name: 'Enter confirmation code' });
  }

  async confirmMfaGuard(email: string) {
    await this.mfaGuardHeading.waitFor();
    const code =
      await this.target.emailClient.getVerifyAccountChangeCode(email);
    await this.page
      .getByRole('textbox', { name: 'Enter 6-digit code' })
      .fill(code);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async confirmMfaGuardIfVisible(email: string) {
    // The guard modal and the setup UI are mutually exclusive on this route.
    // Wait for whichever renders first so this doesn't race a not-yet-shown
    // modal (a bare isVisible() check can skip a guard that is still mounting),
    // then confirm only when it is the guard.
    await Promise.race([
      this.mfaGuardHeading.waitFor({ state: 'visible' }),
      this.introHeading.waitFor({ state: 'visible' }),
    ]);
    if (await this.mfaGuardHeading.isVisible()) {
      await this.confirmMfaGuard(email);
    }
  }
}
