/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jsQR from 'jsqr';
import UPNG from 'upng-js';
import { expect } from '../../lib/fixtures/standard';
import { SettingsLayout } from './layout';
import { getCode } from 'fxa-settings/src/lib/totp';
import { DataTrioComponent } from './components/dataTrio';

export type TotpCredentials = {
  secret: string;
  recoveryCodes: string[];
};

export class TotpPage extends SettingsLayout {
  readonly path = 'settings/two_step_authentication';

  get dataTrio() {
    return new DataTrioComponent(this.page);
  }

  get twoStepAuthenticationHeading() {
    return this.page.getByRole('heading', { name: 'Two-step authentication' });
  }

  get step1Heading() {
    return this.page.getByRole('heading', { name: 'Step 1 of 3' });
  }

  get step1CantScanCodeLink() {
    return this.page.getByTestId('cant-scan-code');
  }

  get step1ManualCode() {
    return this.page.getByTestId('manual-datablock');
  }

  get step1QRCode() {
    return this.page.getByTestId('2fa-qr-code');
  }

  get step1AuthenticationCodeTextbox() {
    return this.page.getByTestId('totp-input-label');
  }

  get step1SubmitButton() {
    return this.page.getByTestId('submit-totp');
  }

  get step1CancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get step2Heading() {
    return this.page.getByRole('heading', { name: 'Step 2 of 3' });
  }

  get step2recoveryCodes() {
    return this.page.getByTestId('datablock');
  }

  get step2ContinueButton() {
    return this.page.getByTestId('ack-recovery-code');
  }

  get step3Heading() {
    return this.page.getByRole('heading', { name: 'Step 3 of 3' });
  }

  get step3FinishButton() {
    return this.page.getByTestId('submit-recovery-code');
  }

  get step3RecoveryCodeTextbox() {
    return this.page.getByTestId('recovery-code-input-field');
  }

  async fillOutStep1FormQR(): Promise<string> {
    await expect(this.twoStepAuthenticationHeading).toBeVisible();
    await expect(this.step1Heading).toBeVisible();

    const png = await this.step1QRCode.screenshot();
    const img = UPNG.decode(png);
    const { data } = jsQR(
      new Uint8ClampedArray(UPNG.toRGBA8(img)[0]),
      img.width,
      img.height
    ) || { data: null };
    if (data === null) {
      throw new Error('No QR code found');
    }

    const secret = new URL(data).searchParams.get('secret');
    if (secret === null) {
      throw new Error('No secret found in QR code');
    }

    const code = await getCode(secret);
    await this.step1AuthenticationCodeTextbox.fill(code);
    await this.step1SubmitButton.click();
    return secret;
  }

  async fillOutStep1FormManual(): Promise<string> {
    await expect(this.twoStepAuthenticationHeading).toBeVisible();
    await expect(this.step1Heading).toBeVisible();

    await this.step1CantScanCodeLink.click();
    const secret = (await this.step1ManualCode.innerText())?.replace(/\s/g, '');
    const code = await getCode(secret);
    await this.step1AuthenticationCodeTextbox.fill(code);
    await this.step1SubmitButton.click();
    return secret;
  }

  async getRecoveryCodes(): Promise<string[]> {
    await expect(this.step2recoveryCodes).toBeVisible();
    const codeList = await this.step2recoveryCodes
      .getByRole('listitem')
      .allTextContents();
    return codeList ? codeList : [];
  }

  async fillOutStep2Form(): Promise<string[]> {
    await expect(this.step2Heading).toBeVisible();

    const recoveryCodes = await this.getRecoveryCodes();
    await this.step2ContinueButton.click();
    return recoveryCodes;
  }

  async fillOutStep3Form(recoveryCode: string): Promise<void> {
    await expect(this.step3Heading).toBeVisible();

    await this.step3RecoveryCodeTextbox.fill(recoveryCode);
    await this.step3FinishButton.click();
  }

  async fillOutTotpForms(): Promise<TotpCredentials> {
    const secret = await this.fillOutStep1FormManual();
    const recoveryCodes = await this.fillOutStep2Form();
    await this.fillOutStep3Form(recoveryCodes[0]);
    return { secret, recoveryCodes };
  }
}
