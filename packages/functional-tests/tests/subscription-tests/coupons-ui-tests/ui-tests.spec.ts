import { test, expect } from '../../../lib/fixtures/standard';

test.describe('ui functionality', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test('verify discount textbox display', async ({
    pages: { relier, subscribe },
  }) => {
    test.slow();
    await relier.goto();
    await relier.clickSubscribe6Month();

    // Verify discount section is displayed
    expect(await subscribe.discountTextbox()).toBe(true);
  });
});
