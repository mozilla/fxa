import { test, expect } from '../../lib/fixtures/standard';

test.describe('404', () => {
  test('visit an invalid page', async ({
    page,
    pages: { login, fourOhFour },
  }) => {
    await fourOhFour.goto('load');
    expect(await fourOhFour.header.isVisible()).toBeTruthy();
    expect(await fourOhFour.homeLink.isVisible()).toBeTruthy();
    await fourOhFour.homeLink.click();
    await page.waitForLoadState();
    expect(await login.emailHeader.isVisible()).toBeTruthy();
  });
});
