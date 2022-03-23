import { test, expect } from '../lib/fixtures/standard';

test.describe('severity-1', () => {
  test('subscribe with credit card and login to product', async ({
    pages: { relier, login, subscribe },
  }, { project }) => {
    test.skip(project.name === 'production', 'prod needs a valid credit card');
    test.skip(project.name === 'local', 'No need to be run on local');
    test.slow();
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setFullName();
    await subscribe.setCreditCardInfo();
    await subscribe.submit();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.submit();
    expect(await relier.isPro()).toBe(true);
  });
});

test.describe('severity-1', () => {
  test('subscribe with paypal and login to product', async ({
    pages: { relier, login, subscribe },
  }, { project }) => {
    test.skip(project.name === 'production', 'prod needs a valid credit card');
    test.skip(project.name === 'local', 'No need to be run on local');
    test.slow();
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setPayPalInfo();
    await subscribe.submit();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.submit();
    expect(await relier.isPro()).toBe(true);
  });
});
