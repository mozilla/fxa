/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MetricsObserver } from '../../lib/metrics';
import { INVALID_VISA, VALID_VISA } from '../../lib/paymentArtifacts';
import { expect, test } from './subscriptionFixtures';

test.describe('severity-2 #smoke', () => {
  test.describe('subscription', () => {
    test('subscribe with credit card and sign in to product', async ({
      page,
      pages: { relier, signin, subscribe },
      credentials,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe();

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();

      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      await relier.goto();
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();

      expect(await relier.isPro()).toBe(true);
    });

    test('subscribe with credit card after initial failed subscription & verify existing user checkout funnel metrics', async ({
      page,
      pages: { relier, signin, subscribe },
      credentials,
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      const metricsObserver = new MetricsObserver(subscribe);
      metricsObserver.startTracking();

      await relier.goto();
      await relier.clickSubscribe();

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();

      await subscribe.confirmPaymentCheckbox.check();
      await subscribe.paymentInformation.fillOutCreditCardInfo(INVALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionErrorHeading).toBeVisible();

      await subscribe.tryAgainButton.click();
      await subscribe.paymentInformation.fillOutCreditCardInfo(VALID_VISA);
      await subscribe.paymentInformation.clickPayNow();

      await expect(subscribe.subscriptionConfirmationHeading).toBeVisible();

      await relier.goto();
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signin.signInButton.click();

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
          return undefined;
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
      pages: { relier, subscribe },
    }, { project }) => {
      test.skip(
        project.name === 'production',
        'no real payment method available in prod'
      );
      await relier.goto();
      await relier.clickSubscribe();

      await expect(subscribe.setupSubscriptionFormHeading).toBeVisible();

      await subscribe.confirmPaymentCheckbox.check();
      const paypalPopup = await subscribe.clickPayPal();
      expect(
        await paypalPopup.title(),
        'The PayPal popup title was not as expected'
      ).toContain('PayPal');
    });
  });
});
