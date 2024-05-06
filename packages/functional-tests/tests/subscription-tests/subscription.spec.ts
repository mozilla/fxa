/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MetricsObserver } from '../../lib/metrics';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { LoginPage } from '../../pages/login';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
  test.describe('subscription', () => {
    test.beforeEach(() => {
      test.slow();
    });

    test('subscribe with credit card and login to product', async ({
      target,
      page,
      pages: { relier, login, subscribe },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

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

    test('subscribe with credit card after initial failed subscription & verify existing user checkout funnel metrics', async ({
      target,
      page,
      pages: { relier, login, subscribe },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      const metricsObserver = new MetricsObserver(subscribe);
      metricsObserver.startTracking();

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

      // check conversion funnel metrics
      const expectedEventTypes = [
        'amplitude.subPaySetup.view',
        'amplitude.subPaySetup.engage',
        'amplitude.subPaySetup.submit',
        'amplitude.subPaySetup.fail',
        'amplitude.subPaySetup.submit',
        'amplitude.subPaySetup.success',
      ];

      // Added as part of FXA-9322 to resolve flaky bug
      // Get record of only "with-account" and subPaySetup event types
      // as customer should already be logged in and we're testing for new subscription
      const actualEventTypes = metricsObserver.rawEvents
        .map((event) => {
          if (
            event.checkoutType === 'with-account' &&
            event.type.startsWith('amplitude.subPaySetup')
          ) {
            return event.type;
          }
        })
        .filter(Boolean);

      // Added as part of FXA-9322 to resolve flaky bug
      // Compares the tail of both arrays in the event of duplicate initial view events
      expect(
        actualEventTypes.slice(
          actualEventTypes.length - expectedEventTypes.length
        )
      ).toMatchObject(expectedEventTypes);
    });

    test('subscribe with paypal opens popup', async ({
      target,
      page,
      pages: { relier, subscribe, login },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      await relier.goto();
      await relier.clickSubscribe();
      await subscribe.setConfirmPaymentCheckbox();
      const paypalPopup = await subscribe.clickPayPal();
      expect(
        await paypalPopup.title(),
        'The PayPal popup title was not as expected'
      ).toContain('PayPal');
    });
  });

  test.describe('Flow, acquisition and new user checkout funnel metrics', () => {
    test.beforeEach(() => {
      test.slow();
    });

    test('Metrics disabled: existing user checkout URL to not have flow params', async ({
      target,
      pages: { settings, relier, page, login },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      // Go to settings page and verify the Data Collection toggle switch is visible
      await settings.goto();
      expect(await settings.dataCollection.isToggleSwitch()).toBe(true);

      // Toggle switch, verify the alert bar appears and its status
      await settings.dataCollection.toggleShareData('off');
      await expect(settings.alertBar).toHaveText(/Opt out successful/);
      expect(await settings.dataCollection.getToggleStatus()).toBe('false');

      // Subscribe to plan and verify URL does not include flow parameter
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).not.toContain('&flow_begin_time=');
    });

    test('Existing user checkout URL to have flow params', async ({
      target,
      pages: { settings, relier, page, login },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      // Go to settings page and verify the Data Collection toggle switch is visible
      await settings.goto();
      expect(await settings.dataCollection.isToggleSwitch()).toBe(true);

      // Toggle switch and verify its status
      await settings.dataCollection.toggleShareData('on');
      expect(await settings.dataCollection.getToggleStatus()).toBe('true');

      // Subscribe to plan and verify URL does include flow parameter
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('New user checkout URL to have flow params', async ({
      target,
      pages: { settings, relier, page, login },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      await settings.goto();
      await settings.signOut();
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('New user checkout URL to have flow params with cache cleared', async ({
      target,
      pages: { settings, login, relier, page },
      testAccountTracker,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );
      await signInAccount(target, page, login, testAccountTracker);

      await settings.goto();
      await settings.signOut();
      await login.clearCache();
      await relier.goto();
      await relier.clickSubscribe6Month();
      expect(page.url()).toContain('&flow_begin_time=');
    });

    test('New user checkout URL to have RP-provided flow params, acquisition params & verify funnel metrics', async ({
      pages: { settings, relier, page, subscribe },
    }, { project }) => {
      test.fixme(true, 'Fix required as of 2023/10/09 (see FXA-8447).');
      test.skip(
        project.name === 'production',
        'test plan not available in prod'
      );

      const metricsObserver = new MetricsObserver(subscribe);
      metricsObserver.startTracking();

      await settings.goto();
      await settings.signOut();
      await relier.goto();

      const subscribeUrl = await relier.getUrl();
      expect(subscribeUrl, 'Subscribe button has no href.').toBeTruthy();

      const rpSearchParamsBefore = relier.getRpSearchParams(subscribeUrl);
      const rpFlowParamsBefore = relier.getRpFlowParams(rpSearchParamsBefore);
      const acquisitionParamsBefore =
        relier.getRpAcquisitionParams(rpSearchParamsBefore);

      // check flow metrics
      await relier.clickSubscribeRPFlowMetrics();
      const rpSearchParamsAfter = relier.getRpSearchParams(page.url());
      const rpFlowParamsAfter = relier.getRpFlowParams(rpSearchParamsAfter);
      expect(rpFlowParamsAfter).toStrictEqual(rpFlowParamsBefore);

      // subscribe, failing first then succeeding
      await subscribe.setEmailAndConfirmNewUser();
      await subscribe.setConfirmPaymentCheckbox();
      await subscribe.setFullName();
      await subscribe.setFailedCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.clickTryAgain();
      await subscribe.setCreditCardInfo();
      await subscribe.clickPayNow();
      await subscribe.submit();

      // check acquisition metrics
      const acquisitionParamsAfter =
        metricsObserver.getAcquisitionParamsFromEvents();
      expect(acquisitionParamsAfter).toStrictEqual(acquisitionParamsBefore);

      // check conversion funnel metrics
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
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
