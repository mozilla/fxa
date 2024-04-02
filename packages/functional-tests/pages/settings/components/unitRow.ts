import { Page } from '@playwright/test';
import { ConnectedService } from './connectedService';

export class UnitRow {
  constructor(readonly page: Page, readonly id: string) {}

  protected async clickCta() {
    const waitForNavigation = this.page.waitForEvent('framenavigated');
    await this.page.locator(`[data-testid=${this.id}-unit-row-route]`).click();
    return waitForNavigation;
  }

  protected clickShowModal() {
    return this.page.locator(`[data-testid=${this.id}-unit-row-modal]`).click();
  }

  protected clickShowSecondaryModal() {
    return this.page
      .locator(`[data-testid=${this.id}-secondary-unit-row-modal]`)
      .click();
  }

  statusText() {
    return this.page
      .locator(`[data-testid=${this.id}-unit-row-header-value]`)
      .innerText();
  }

  clickRefresh() {
    return this.page.locator(`[data-testid=${this.id}-refresh]`).click();
  }

  async screenshot() {
    const el = await this.page.waitForSelector(
      `[data-testid=${this.id}-unit-row]`
    );
    return el.screenshot();
  }
}

export class AvatarRow extends UnitRow {
  async isDefault() {
    const el = await this.page.$('[data-testid=avatar-nondefault]');
    if (!el) {
      return true;
    }
    const src = await el.getAttribute('src');
    return src?.includes('/avatar/');
  }

  clickAdd() {
    return this.clickCta();
  }

  clickChange() {
    return this.clickCta();
  }
}

export class DisplayNameRow extends UnitRow {
  clickAdd() {
    return this.clickCta();
  }
}

export class PasswordRow extends UnitRow {
  clickChange() {
    return this.clickCta();
  }
}

export class PrimaryEmailRow extends UnitRow {}

export class SecondaryEmailRow extends UnitRow {
  clickAdd() {
    return this.clickCta();
  }
  clickMakePrimary() {
    return this.page
      .locator('[data-testid=secondary-email-make-primary]')
      .click();
  }
  clickDelete() {
    return this.page.locator('[data-testid=secondary-email-delete]').click();
  }
}

export class RecoveryKeyRow extends UnitRow {
  get status() {
    return this.page.getByTestId('recovery-key-unit-row-header-value');
  }

  get createButton() {
    return this.page.getByTestId('recovery-key-unit-row-route');
  }

  clickCreate() {
    return this.clickCta();
  }

  clickDelete() {
    return this.page
      .getByRole('button', { name: 'Delete account recovery key' })
      .click();
  }
}

export class TotpRow extends UnitRow {
  get status() {
    return this.page.getByTestId('two-step-unit-row-header-value');
  }

  get addButton() {
    return this.page.getByTestId('two-step-unit-row-route');
  }

  clickAdd() {
    return this.clickCta();
  }
  clickChange() {
    return this.clickShowModal();
  }
  clickDisable() {
    return this.page
      .locator(`[data-testid=two-step-disable-button-unit-row-modal]`)
      .click();
  }
}

export class ConnectedServicesRow extends UnitRow {
  async services() {
    await this.page.waitForSelector('[data-testid=settings-connected-service]');
    const elements = await this.page.$$(
      '[data-testid=settings-connected-service]'
    );
    return Promise.all(
      elements.map((el) => ConnectedService.create(el, this.page))
    );
  }
}

export class DataCollectionRow extends UnitRow {
  getToggleStatus() {
    return this.page
      .locator('[data-testid=metrics-opt-out]')
      .getAttribute('aria-checked');
  }

  async isToggleSwitch() {
    const toggle = this.page.locator('[data-testid=metrics-opt-out]');
    await toggle.waitFor();
    return toggle.isVisible();
  }

  async toggleShareData(action: 'on' | 'off') {
    const toggle = this.page.locator('[data-testid=metrics-opt-out]');
    const checked: string | null = await toggle.getAttribute('aria-checked');
    if (
      (checked === 'true' && action === 'on') ||
      (checked === 'false' && action === 'off')
    ) {
      return;
    }
    return await toggle.click();
  }
}
