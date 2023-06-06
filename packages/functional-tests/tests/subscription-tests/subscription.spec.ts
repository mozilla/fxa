import { test, expect } from '../../lib/fixtures/standard';
import { MetricsObserver } from '../../lib/metrics';

test.describe.configure({ mode: 'parallel' });

test.describe('subscription test with cc and paypal', () => {
  let metricsObserver: MetricsObserver;

  test.beforeEach(({ pages: { subscribe } }) => {
    test.slow();
    metricsObserver = new MetricsObserver(subscribe);
    metricsObserver.startTracking();
  });

  test('subscribe with credit card and login to product', async ({
    pages: { relier, login, subscribe },
  }, { project }) => {
    test.skip(
      project.name === 'production',
      'no real payment method available in prod'
    );
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setConfirmPaymentCheckbox();
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
  }, { project }) => {
    test.skip(
      project.name === 'production',
      'no real payment method available in prod'
    );
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setConfirmPaymentCheckbox();
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

    const expectedEventTypes = [
      'amplitude.subPaySetup.view',
      'amplitude.subPaySetup.engage',
      'amplitude.subPaySetup.submit',
      'amplitude.subPaySetup.fail',
      'amplitude.subPaySetup.submit',
      'amplitude.subPaySetup.success',
    ];
    const actualEventTypes = metricsObserver.rawEvents.map((event) => {
      return event.type;
    });
    expect(actualEventTypes).toMatchObject(expectedEventTypes);
  });

  test('subscribe with paypal and login to product', async ({
    pages: { relier, login, subscribe },
  }, { project }) => {
    test.skip(
      project.name === 'production',
      'no real payment method available in prod'
    );
    await relier.goto();
    await relier.clickSubscribe();
    await subscribe.setConfirmPaymentCheckbox();
    await subscribe.setPayPalInfo();
    await subscribe.submit();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.submit();
    expect(await relier.isPro()).toBe(true);
  });
});

test.describe('metrics - flow metrics query params', () => {
  test.beforeEach(() => {
    test.slow();
  });
  test.describe('severity-2', () => {
    test('logged in and toggle off Share Data, Checkout to not have flow params in URL', async ({
      pages: { settings, relier, page },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
      // Go to settings page and verify the Data Collection toggle switch is visible
      await settings.goto();
      expect(await settings.dataCollection.isToggleSwitch()).toBe(true);

      // Toggle swtich, verify the alert bar appears and its status
      await settings.dataCollection.toggleShareData('off');
      expect(await settings.alertBarText()).toContain('Opt out successful.');
      expect(await settings.dataCollection.getToggleStatus()).toBe('false');

      // Subscribe to plan and verify URL does not include flow parameter
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).not.toContain('&flow_begin_time=');
    });
  });

  test.describe('severity-3', () => {
    test('logged in and toggle on Share Data, Checkout to have flow params in URL', async ({
      pages: { settings, relier, page },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
      // Go to settings page and verify the Data Collection toggle switch is visible
      await settings.goto();
      expect(await settings.dataCollection.isToggleSwitch()).toBe(true);

      // Toggle swtich and verify its status
      await settings.dataCollection.toggleShareData('on');
      expect(await settings.dataCollection.getToggleStatus()).toBe('true');

      // Subscribe to plan and verify URL does not include flow parameter
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('not logged in, Checkout to have flow params in URL', async ({
      pages: { settings, relier, page },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
      await settings.goto();
      await settings.signOut();
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('not logged in, user has no account and has not previously signed in, Checkout to have flow params in URL', async ({
      pages: { settings, login, relier, page },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
      await settings.goto();
      await settings.signOut();
      await login.clearCache();
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('not logged in, Checkout to have RP-provided flow params in URL', async ({
      pages: { settings, relier, page },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not yet available in prod'
      );
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
