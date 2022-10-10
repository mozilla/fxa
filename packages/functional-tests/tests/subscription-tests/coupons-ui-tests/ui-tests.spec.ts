import { test, expect } from '../../../lib/fixtures/standard';

test.describe('ui functionality', () => {
  test.beforeEach(({ }, { project }) => {
    test.skip(project.name !== 'stage', "Only run these tests in 'stage' env");
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
