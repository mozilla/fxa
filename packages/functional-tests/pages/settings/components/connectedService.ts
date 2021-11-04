import { ElementHandle, Page } from '@playwright/test';

export class ConnectedService {
  name: string;
  constructor(
    readonly element: ElementHandle<HTMLElement | SVGElement>,
    readonly page: Page
  ) {}

  static async create(
    element: ElementHandle<HTMLElement | SVGElement>,
    page: Page
  ) {
    const service = new ConnectedService(element, page);
    service.name = await service.getName();
    return service;
  }

  async getName() {
    const p = await this.element.waitForSelector('[data-testid=service-name]');
    return p.innerText();
  }

  async signout() {
    const button = await this.element.waitForSelector(
      '[data-testid=connected-service-sign-out]'
    );
    return button.click();
  }
}
