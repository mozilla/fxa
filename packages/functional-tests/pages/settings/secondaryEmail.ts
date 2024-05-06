import { expect } from '@playwright/test';
import { EmailHeader, EmailType } from '../../lib/email';
import { SettingsLayout } from './layout';

export class SecondaryEmailPage extends SettingsLayout {
  readonly path = 'settings/emails';

  get secondaryEmailHeading() {
    return this.page.getByRole('heading', { name: 'Secondary email' });
  }

  get step1Heading() {
    return this.page.getByRole('heading', { name: 'Step 1 of 2' });
  }

  get emailTextbox() {
    return this.page.getByRole('textbox', { name: 'email' });
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  get step2Heading() {
    return this.page.getByRole('heading', { name: 'Step 2 of 2' });
  }

  get verificationCodeTextbox() {
    return this.page.getByTestId('verification-code-input-field');
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: 'confirm' });
  }

  async submit() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.saveButton.click();
    return waitForNavigation;
  }

  async addSecondaryEmail(email: string): Promise<void> {
    await expect(this.secondaryEmailHeading).toBeVisible();
    await expect(this.step1Heading).toBeVisible();

    await this.emailTextbox.fill(email);
    await this.saveButton.click();
    const code: string = await this.target.emailClient.waitForEmail(
      email,
      EmailType.verifySecondaryCode,
      EmailHeader.verifyCode
    );
    await this.target.emailClient.clear(email);

    await expect(this.step2Heading).toBeVisible();

    await this.verificationCodeTextbox.fill(code);
    await this.confirmButton.click();
  }
}
