import { test, expect } from '../../lib/fixtures/standard';

test.describe('subscription test with cc and paypal', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test('subscribe with credit card and login to product', async ({
    pages: { relier, login, subscribe },
  }) => {
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setFullName();
    await subscribe.setCreditCardInfo();
    await subscribe.clickPayNow();
    await subscribe.submit();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.submit();
    expect(await relier.isPro()).toBe(true);
  });

  test('subscribe with credit card after initial failed subscription', async ({
    pages: { relier, login, subscribe },
  }) => {
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setFullName();
    await subscribe.setFailedCreditCardInfo();
    await subscribe.clickPayNow();
    await subscribe.clickTryAgain();
    await subscribe.setCreditCardInfo();
    await subscribe.clickPayNow();
    await subscribe.submit();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.submit();
    expect(await relier.isPro()).toBe(true);
  });

  //Diabling the test as this is being flaky because Paypal Sandbox is being finicky
  // FXA - 6786, FXA - 6788
  /*test('subscribe with paypal and login to product', async ({
    pages: { relier, login, subscribe },
  }) => {
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setPayPalInfo();
    await subscribe.submit();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.submit();
    expect(await relier.isPro()).toBe(true);
  });*/
});

test.describe('metrics - flow metrics query params', () => {
  test.beforeEach(() => {
    test.slow();
  });
  test.describe('severity-2', () => {
    test('logged in and toggle off Share Data, Checkout to not have flow params in URL', async ({
      pages: { settings, relier, page },
    }) => {
      await settings.goto();
      await settings.dataCollection.toggleShareData('off');
      const ariaChecked = await settings.dataCollection.getToggleStatus();
      expect(ariaChecked).toBe('false');

      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).not.toContain('&flow_begin_time=');
    });
  });

  test.describe('severity-3', () => {
    test('logged in and toggle on Share Data, Checkout to have flow params in URL', async ({
      pages: { settings, relier, page },
    }) => {
      await settings.goto();
      await settings.dataCollection.toggleShareData('on');
      const ariaChecked = await settings.dataCollection.getToggleStatus();
      expect(ariaChecked).toBe('true');

      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('not logged in, Checkout to have flow params in URL', async ({
      pages: { settings, relier, page },
    }) => {
      await settings.goto();
      await settings.signOut();
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('not logged in, user has no account and has not previously signed in, Checkout to have flow params in URL', async ({
      pages: { settings, login, relier, page },
    }) => {
      await settings.goto();
      await settings.signOut();
      await login.clearCache();
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('not logged in, Checkout to have RP-provided flow params in URL', async ({
      pages: { settings, relier, page },
    }) => {
      await settings.goto();
      await settings.signOut();
      await relier.goto();

      const subscribeUrl = await relier.getUrl();
      if (!subscribeUrl) {
        fail('Subscribe button has no href.');
      }
      const rpSearchParamsBefore = await relier.getRpSearchParams(subscribeUrl);
      const rpFlowParamsBefore = await relier.getRpFlowParams(
        rpSearchParamsBefore
      );
      await relier.clickSubscribeRPFlowMetrics();
      const rpSearchParamsAfter = await relier.getRpSearchParams(page.url());
      const rpFlowParamsAfter = await relier.getRpFlowParams(
        rpSearchParamsAfter
      );
      expect(rpFlowParamsAfter).toStrictEqual(rpFlowParamsBefore);
    });
  });
});
