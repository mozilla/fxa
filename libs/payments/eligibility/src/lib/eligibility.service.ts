/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { SubscriptionManager, SubplatInterval } from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import {
  GoogleIapPurchaseManager,
  AppleIapPurchaseManager,
} from '@fxa/payments/iap';
import { EligibilityManager } from './eligibility.manager';
import {
  EligibilityStatus,
  LocationStatus,
  SubscriptionEligibilityResult,
} from './eligibility.types';
import { LocationConfig } from './location.config';
import { EligibilityError } from './eligibility.error';

@Injectable()
export class EligibilityService {
  constructor(
    private locationConfig: LocationConfig,
    private productConfigurationManager: ProductConfigurationManager,
    private eligibilityManager: EligibilityManager,
    private subscriptionManager: SubscriptionManager,
    private googleIapPurchaseManager: GoogleIapPurchaseManager,
    private appleIapPurchaseManager: AppleIapPurchaseManager
  ) { }

  /**
   * Checks if user is eligible to subscribe to price
   */
  async checkEligibility(
    interval: SubplatInterval,
    offeringConfigId: string,
    uid?: string | null | undefined,
    stripeCustomerId?: string | null | undefined
  ): Promise<SubscriptionEligibilityResult> {
    if (!uid) {
      if (stripeCustomerId) {
        throw new EligibilityError(
          "'uid' is required when 'stripeCustomerId' is provided"
        );
      }

      return {
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      };
    }

    const targetOfferingResult =
      await this.productConfigurationManager.getEligibilityContentByOffering(
        offeringConfigId
      );

    const targetOffering = targetOfferingResult.getOffering();

    const [appleIapPurchases, googleIapPurchases] = await Promise.all([
      this.appleIapPurchaseManager.getForUser(uid),
      this.googleIapPurchaseManager.getForUser(uid),
    ]);
    if (appleIapPurchases.length || googleIapPurchases.length) {
      const iapOfferingResult =
        await this.productConfigurationManager.getIapOfferings([
          ...appleIapPurchases.map((el) => el.productId),
          ...googleIapPurchases.map((el) => el.sku),
        ]);

      if (iapOfferingResult.hasOverlap(offeringConfigId)) {
        return {
          subscriptionEligibilityResult: EligibilityStatus.BLOCKED_IAP,
        };
      }
    }

    if (!stripeCustomerId) {
      return {
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      };
    }

    const subscriptions =
      await this.subscriptionManager.listForCustomer(stripeCustomerId);

    const subscribedPrices = subscriptions
      .flatMap((subscription) => subscription.items.data)
      .map((item) => item.price);

    const priceIds = subscribedPrices.map((price) => price.id);

    const overlaps = await this.eligibilityManager.getOfferingOverlap({
      priceIds,
      targetOffering,
    });

    const eligibility = await this.eligibilityManager.compareOverlaps(
      overlaps,
      targetOffering,
      interval,
      subscribedPrices
    );

    return eligibility;
  }

  async getProductAvailabilityForLocation(
    offeringId: string,
    countryCode?: string
  ) {
    if (!countryCode) {
      return {
        status: LocationStatus.Unresolved,
        message: 'Country code was not resolved',
      };
    }

    const { countries } =
      await this.productConfigurationManager.fetchCMSData(offeringId);
    const supportedCountries = countries.map((country) => country.slice(0, 2));

    const isSanctionedLocation = countryCode
      ? this.locationConfig.subscriptionsUnsupportedLocations.includes(
        countryCode
      )
      : undefined;

    const isSupportedLocation = countryCode
      ? supportedCountries.includes(countryCode)
      : undefined;

    if (isSanctionedLocation) {
      return {
        status: LocationStatus.SanctionedLocation,
        message: `Customer is in a sanctioned location: ${countryCode}`,
      };
    }

    if (isSupportedLocation === false) {
      return {
        status: LocationStatus.ProductNotAvailable,
        message: `Product is not available in customer's location: ${countryCode}`,
      };
    }

    return {
      status: LocationStatus.Valid,
      message: `Customer is in a location where the product is supported: ${countryCode}`,
    };
  }
}
