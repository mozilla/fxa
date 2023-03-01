/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';

/**
 * Minimum number of days before monthly plan renewal to be upgraded to Stripe automatic tax
 */
const MONTHLY_NOTICE_DAYS = 14;
/**
 * Minimum number of days before 6-month and yearly renewal to be upgraded to Stripe automatic tax
 */
const YEARLY_NOTICE_DAYS = 30;
/**
 * Convert from Stripe dates to Unix milliseconds
 */
const SECONDS_TO_MILLISECONDS = 1000;

/**
 * Represents a mapping of user uids to IP addresses
 */
export interface IpAddressMap {
  [key: string]: string;
}

/**
 * The file format we expect to be provided to match customer IP addresses
 */
export interface IpAddressMapFileEntry {
  uid: string;
  remote_address_chain: string;
}

/**
 * Firestore subscriptions contain additional expanded information
 * on top of the base Stripe.Subscription type
 */
export interface FirestoreSubscription extends Stripe.Subscription {
  customer: string;
  plan: Stripe.Plan;
  price: Stripe.Price;
}

export class StripeAutomaticTaxConverterHelpers {
  constructor() {}

  /**
   * Converts a list of customers and their remote address chains to a simple mapping
   * where the keys represent the user's uid and the value represents their public IP
   * @param ipAddressList a mapping read from a file exported from our logs
   * @returns A simple mapping with {uid: public IP}
   */
  processIPAddressList(ipAddressList: IpAddressMapFileEntry[]) {
    return ipAddressList.reduce((ipAddressMap, logEntry) => {
      const clientIP = this.getClientIPFromRemoteAddressChain(
        logEntry.remote_address_chain
      );
      if (!clientIP) return ipAddressMap;

      ipAddressMap[logEntry.uid] = clientIP;
      return ipAddressMap;
    }, {} as IpAddressMap);
  }

  /**
   * Retrieves the originating user's IP address from the remote address chain
   * @param remoteAddressChain a string containing a JSON list of IPs, such as '["10.0.0.1"]'
   * @returns The originating IP address or undefined if it cannot be determined
   */
  getClientIPFromRemoteAddressChain(remoteAddressChain: string) {
    const [clientIP] = JSON.parse(remoteAddressChain) as string[];

    if (!clientIP?.trim()) return;
    if (this.isLocalIP(clientIP)) return;

    return clientIP;
  }

  /**
   * Check whether an IP address string exists in local address space
   * @param ipAddress A string representing an IP address
   * @returns true or false, based on whether the IP address is local or not
   */
  isLocalIP(ipAddress: string) {
    const addressChunks = ipAddress.split('.');
    // Class A private address space
    if (addressChunks[0] === '10') return true;
    // Class B private address space
    if (
      addressChunks[0] === '172' &&
      parseInt(addressChunks[1], 10) >= 16 &&
      parseInt(addressChunks[1], 10) <= 31
    )
      return true;
    // Class C private address space
    if (addressChunks[0] === '192' && addressChunks[1] === '168') return true;

    return false;
  }

  /**
   * Checks if Stripe customer is in a taxable location
   * @returns True if the user is currently taxable
   */
  isTaxEligible(customer: Stripe.Customer) {
    return customer.tax?.automatic_tax === 'supported';
  }

  /**
   * Filters for all subscriptions that are eligible for upgrade to Stripe automatic tax
   * @param subscriptions A list of subscriptions from Firestore
   * @returns A filtered list of eligible subscriptions
   */
  filterEligibleSubscriptions(subscriptions: FirestoreSubscription[]) {
    return subscriptions
      .filter(this.willBeRenewed)
      .filter(this.isStripeTaxDisabled)
      .filter(this.isWithinNoticePeriod);
  }

  /**
   * Check whether subscription is current & continuing
   * @returns True if subscription is current & continuing
   */
  willBeRenewed(sub: Stripe.Subscription) {
    return (
      !sub.cancel_at && !sub.cancel_at_period_end && sub.status === 'active'
    );
  }

  /**
   * Check if subscription currently is automatically taxed
   * @returns True if subscription has Stripe automatic tax disabled
   */
  isStripeTaxDisabled(subscription: Stripe.Subscription) {
    return !subscription.automatic_tax.enabled;
  }

  /**
   * Checks whether subscription renews too soon to be upgraded to
   * Stripe Automatic Tax
   * 1 month plans require at least 14 days of notice
   * 6 month and yearly plans require at least 30 days of notice
   * This function does not support plans with intervals of less than 1 month
   * @returns True if the subscription will be renewed far enough in the future to be upgraded
   */
  isWithinNoticePeriod(sub: Stripe.Subscription) {
    const noSoonerThan = new Date();
    if (sub.items.data[0].plan.interval === 'month') {
      noSoonerThan.setUTCDate(noSoonerThan.getUTCDate() + MONTHLY_NOTICE_DAYS);
    } else {
      noSoonerThan.setUTCDate(noSoonerThan.getUTCDate() + YEARLY_NOTICE_DAYS);
    }

    const renewalDate = new Date(
      sub.current_period_end * SECONDS_TO_MILLISECONDS
    );

    return noSoonerThan < renewalDate;
  }

  /**
   * Gets a number of "special" tax amounts from Stripes tax amount list, such as those
   * used for Canada.
   * @param taxAmounts A list of tax amounts with tax rates expanded
   * @returns The amount of the first matching tax amount
   */
  getSpecialTaxAmounts(taxAmounts: Stripe.Invoice.TotalTaxAmount[]) {
    const specialTaxAmounts = {
      hst: 0,
      pst: 0,
      gst: 0,
      qst: 0,
      rst: 0,
    };

    for (const taxAmount of taxAmounts) {
      const taxRate = taxAmount.tax_rate as Stripe.TaxRate;
      const key = taxRate.display_name.toLowerCase();

      if (key in specialTaxAmounts) {
        // This must be done via display name since the tax rate ID changes every time for automatic tax
        specialTaxAmounts[key as keyof typeof specialTaxAmounts] +=
          taxAmount.amount;
      }
    }

    return specialTaxAmounts;
  }
}
