/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { L_LIST } from './constants';
import { IpnMerchPmtType, IpnMessage } from './paypal.client.types';

/**
 * Returns an ISO string without milliseconds appropriate for PayPal dates.
 *
 * @param d
 */
export function toIsoString(d: Date): string {
  return d.toISOString().slice(0, -5) + 'Z';
}

/**
 * Type Guard to indicate whether the given IPN Message is a Merchant Payment
 * message.
 *
 * @param ipnMessage
 */
export function isIpnMerchPmt(
  ipnMessage: IpnMessage
): ipnMessage is IpnMerchPmtType {
  return ['merch_pmt', 'mp_cancel'].includes(ipnMessage.txn_type);
}

/**
 * Encodes a simple object to query string format
 * Supports L_ style item list conversion
 * in compliance with https://developer.paypal.com/api/nvp-soap/NVPAPIOverview/#link-urlencoding
 */
export function objectToNVP(object: Record<string, any>): string {
  // Convert undefined values to an empty string
  const santizedObject = Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, v === undefined ? '' : v])
  );
  const urlSearchParams = new URLSearchParams(santizedObject);

  // Convert array containing L_ objects to Paypal NVP list string
  if (object['L']) {
    urlSearchParams.delete('L');
    object['L'].forEach((listItem: any, i: number) => {
      Object.keys(listItem).forEach((key) => {
        urlSearchParams.append(`L_${key}${i}`, listItem[key]);
      });
    });
  }

  urlSearchParams.sort();

  return urlSearchParams.toString();
}

/**
 * Decodes a query string from Paypal to a simple map
 * in compliance with https://developer.paypal.com/api/nvp-soap/NVPAPIOverview/#link-urlencoding
 * Additionally pulls out members within Paypal's list format
 */
export function nvpToObject(payload: string): Record<string, any> {
  const urlSearchParams = new URLSearchParams(payload);
  const result: Record<string, any> = {};
  const lst: any[] = [];
  for (const [key, value] of urlSearchParams.entries()) {
    const match = key.match(L_LIST);
    if (!match) {
      result[key] = value;
      continue;
    }
    const [name, indexString] = [match[1], match[2]];
    const index = parseInt(indexString);

    if (!lst[index]) {
      lst[index] = {};
    }
    lst[index][name] = value;
  }
  if (lst.length !== 0) {
    result['L'] = lst;
  }
  return result;
}
