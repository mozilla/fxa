import { Page } from '@playwright/test';
import { ConnectedService } from './connectedService';

export class UnitRow {
  constructor(readonly page: Page, readonly id: string) {}

  protected clickCta() {
    return Promise.all([
      this.page.click(`[data-testid=${this.id}-unit-row-route]`),
      this.page.waitForNavigation(),
    ]);
  }

  protected clickShowModal() {
    return this.page.click(`[data-testid=${this.id}-unit-row-modal]`);
  }

  protected clickShowSecondaryModal() {
    return this.page.click(`[data-testid=${this.id}-secondary-unit-row-modal]`);
  }

  statusText() {
    return this.page.innerText(
      `[data-testid=${this.id}-unit-row-header-value]`
    );
  }

  clickRefresh() {
    return this.page.click(`[data-testid=${this.id}-refresh]`);
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
    return src.includes('/avatar/');
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
    return this.page.click('[data-testid=secondary-email-make-primary]');
  }
  clickDelete() {
    return this.page.click('[data-testid=secondary-email-delete]');
  }
}

export class RecoveryKeyRow extends UnitRow {
  clickCreate() {
    return this.clickCta();
  }
  clickRemove() {
    return this.clickShowModal();
  }
}

export class TotpRow extends UnitRow {
  clickAdd() {
    return this.clickCta();
  }
  clickChange() {
    return this.clickShowModal();
  }
  clickDisable() {
    return this.page.click(
      `[data-testid=two-step-disable-button-unit-row-modal]`
    );
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
