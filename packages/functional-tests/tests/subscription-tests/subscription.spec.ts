/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { MetricsObserver } from '../../lib/metrics';

test.describe.configure({ mode: 'parallel' });

test.describe('severity-2 #smoke', () => {
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

    test('subscribe with credit card after initial failed subscription & verify existing user checkout funnel metrics', async ({
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

  test.describe('Flow, acquisition and new user checkout funnel metrics', () => {
    let metricsObserver: MetricsObserver;

    test.beforeEach(({ pages: { subscribe } }) => {
      test.slow();
      metricsObserver = new MetricsObserver(subscribe);
      metricsObserver.startTracking();
    });

    test.describe('severity-2', () => {
      test('Metrics disabled: existing user checkout URL to not have flow params', async ({
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

    test.describe('severity-2', () => {
      test('Existing user checkout URL to have flow params', async ({
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

      test('New user checkout URL to have flow params', async ({
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

      test('New user checkout URL to have flow params with cache cleared', async ({
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

      /* Disabling test - to fix in FXA-8447
      test('New user checkout URL to have RP-provided flow params, acquisition params & verify funnel metrics', async ({
        pages: { settings, relier, page, subscribe },
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
    */
    });
  });
});
