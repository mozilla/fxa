/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jsQR from 'jsqr';
import UPNG from 'upng-js';
import { expect } from '../../lib/fixtures/standard';
import { SettingsLayout } from './layout';
import { getTotpCode } from '../../lib/totp';
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

  get setup2faAppHeading() {
    return this.page.getByRole('heading', {
      name: 'Connect to your authenticator app',
    });
  }

  get step1CantScanCodeLink() {
    return this.page.getByRole('button', { name: 'Can’t scan QR code?' });
  }

  get step1ManualCode() {
    return this.page.getByTestId('manual-datablock');
  }

  get step1QRCode() {
    return this.page.getByTestId('2fa-qr-code');
  }

  get step1AuthenticationCodeTextbox() {
    return this.page.getByRole('textbox', { name: 'Enter 6-digit code' });
  }

  get step1SubmitButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get recoveryChoiceHeading() {
    return this.page.getByRole('heading', { name: 'Choose a recovery method' });
  }

  get backupCodesRadioOption() {
    return this.page
      .locator('label')
      .filter({ hasText: 'Backup authentication' });
  }

  get recoveryPhoneRadioOption() {
    return this.page.locator('label').filter({ hasText: 'Recovery phone' });
  }

  get recoveryChoiceSubmitButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get backupCodesDownloadHeading() {
    return this.page.getByRole('heading', {
      name: 'Save backup authentication codes',
    });
  }

  get backupCodesDatablock() {
    return this.page.getByTestId('datablock');
  }

  get backupCodesDownloadContinueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get confirmBackupCodeHeading() {
    return this.page.getByRole('heading', {
      name: 'Enter backup authentication code',
    });
  }

  get confirmBackupCodeSubmitButton() {
    return this.page.getByRole('button', { name: 'Finish' });
  }

  get confirmBackupCodeTextbox() {
    return (
      this.page
        .getByRole('textbox', { name: 'Enter 10-character code' })
        // for the "old" backup codes replacement flow
        .or(this.page.getByTestId('recovery-code-input-label'))
    );
  }

  async setUp2faAppWithQrCode(): Promise<string> {
    await expect(this.twoStepAuthenticationHeading).toBeVisible();
    await expect(this.setup2faAppHeading).toBeVisible();

    const png = await this.step1QRCode.screenshot();
    // @ts-ignore
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

    const code = await getTotpCode(secret);
    await this.step1AuthenticationCodeTextbox.fill(code);
    await this.step1SubmitButton.click();
    return secret;
  }

  async setUp2faAppWithManualCode(): Promise<string> {
    await expect(this.twoStepAuthenticationHeading).toBeVisible();
    await expect(this.setup2faAppHeading).toBeVisible();

    await this.step1CantScanCodeLink.click();
    const secret = (await this.step1ManualCode.innerText())?.replace(/\s/g, '');
    const code = await getTotpCode(secret);
    await this.step1AuthenticationCodeTextbox.fill(code);
    await this.step1SubmitButton.click();
    return secret;
  }

  async chooseBackupCodesOption(): Promise<void> {
    await expect(this.recoveryChoiceHeading).toBeVisible();
    await this.backupCodesRadioOption.click();
    await this.recoveryChoiceSubmitButton.click();
  }

  async chooseRecoveryPhoneOption(): Promise<void> {
    await expect(this.recoveryChoiceHeading).toBeVisible();
    await this.recoveryPhoneRadioOption.click();
    await this.recoveryChoiceSubmitButton.click();
  }

  async getRecoveryCodes(): Promise<string[]> {
    await expect(this.backupCodesDatablock).toBeVisible();
    const codeList = await this.backupCodesDatablock
      .getByRole('listitem')
      .allTextContents();
    return codeList ? codeList : [];
  }

  async backupCodesDownloadStep(): Promise<string[]> {
    await expect(this.backupCodesDownloadHeading).toBeVisible();

    const recoveryCodes = await this.getRecoveryCodes();
    await this.backupCodesDownloadContinueButton.click();
    return recoveryCodes;
  }

  async confirmBackupCodeStep(recoveryCode: string): Promise<void> {
    await expect(this.confirmBackupCodeHeading).toBeVisible();
    await this.confirmBackupCodeTextbox.fill(recoveryCode);
    await this.confirmBackupCodeSubmitButton.click();
  }

  async setUpTwoStepAuthWithQrAndBackupCodesChoice(): Promise<TotpCredentials> {
    const secret = await this.setUp2faAppWithQrCode();
    await this.chooseBackupCodesOption();
    const recoveryCodes = await this.backupCodesDownloadStep();
    await this.confirmBackupCodeStep(recoveryCodes[0]);
    return { secret, recoveryCodes };
  }

  async setUpTwoStepAuthWithManualCodeAndBackupCodesChoice(): Promise<TotpCredentials> {
    const secret = await this.setUp2faAppWithManualCode();
    await this.chooseBackupCodesOption();
    const recoveryCodes = await this.backupCodesDownloadStep();
    await this.confirmBackupCodeStep(recoveryCodes[0]);
    return { secret, recoveryCodes };
  }

  async startTwoStepAuthWithQrCodeAndRecoveryPhoneChoice(): Promise<{
    secret: string;
  }> {
    const secret = await this.setUp2faAppWithManualCode();
    await this.chooseRecoveryPhoneOption();
    return { secret };
  }
}
