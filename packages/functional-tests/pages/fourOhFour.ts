import { BaseLayout } from './layout';

export class FourOhFourPage extends BaseLayout {
  readonly path = 'four-oh-four';

  readonly selectors = {
    HEADER: '#fxa-404-header',
    LINK_HOME: '#fxa-404-home',
  };

  get header() {
    return this.page.locator(this.selectors.HEADER);
  }

  get homeLink() {
    return this.page.locator(this.selectors.LINK_HOME);
  }
}
