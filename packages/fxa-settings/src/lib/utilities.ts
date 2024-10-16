/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Encode from 'base32-encode';
import { AttachedClient } from '../models/Account';

// Various utilities that don't fit in a standalone lib

/**
 * Recursively merge an object
 **/
export function deepMerge(
  target: Hash<any>,
  ...sources: Hash<any>[]
): Hash<any> {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  for (const key in source) {
    const value = source[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (!target[key]) {
        Object.assign(target, { [key]: {} });
      }

      deepMerge(target[key], value);
    } else {
      Object.assign(target, { [key]: value });
    }
  }

  return deepMerge(target, ...sources);
}

export function getSearchParams(paramKeys: string[], locationHref: string) {
  const { searchParams } = new URL(locationHref);
  const params: Record<string, string | null> = {};

  for (const paramKey of paramKeys) {
    params[paramKey] = searchParams.get(paramKey);
  }
  return params;
}

/**
 * Convert a search string to its object representation, one entry
 * per query parameter. Assumes the string is a search string and
 * not a full URL without a search string.
 */
export function searchParams(str = '', allowedFields?: string[]) {
  // ditch everything before the ? and from # to the end
  const search = str.replace(/(^.*\?|#.*$)/g, '').trim();
  if (!search) {
    return {};
  }

  return splitEncodedParams(search, allowedFields!);
}

/**
 * Return the value of a single query parameter in the string
 */
export function searchParam(name: string, str?: string) {
  const params = searchParams(str);
  return params[name];
}

/**
 * Convert a URI encoded string to its object representation.
 *
 * `&` is the expected delimiter between parameters.
 * `=` is the delimiter between a key and a value.
 */
export function splitEncodedParams(
  str = '',
  allowedFields?: string[]
): Record<string, string> {
  const pairs = str.split('&');
  const terms: { [key: string]: string } = {};

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    terms[key] = decodeURIComponent(value).trim();
  });

  if (!allowedFields) {
    return terms;
  }

  return Object.keys(terms)
    .filter((key) => allowedFields.indexOf(key) >= 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: terms[key] }), {});
}

export function isMobileDevice(
  client?: Pick<AttachedClient, 'deviceType' | 'name'>
) {
  if (client) {
    return (
      client.deviceType === 'mobile' ||
      (client.name || '').toLowerCase().includes('ipad')
    );
  }
  return /mobi/i.test(navigator.userAgent);
}

// Crockford base32 Regex. Case insensitive and excludes I, L, O, U
const B32_STRING = /^[0-9A-HJ-KM-NP-TV-Z]+$/i;
export function isBase32Crockford(value: string) {
  return B32_STRING.test(value);
}

export function formatRecoveryKey(recoveryKeyBuffer: ArrayBufferLike) {
  return base32Encode(recoveryKeyBuffer, 'Crockford').match(/.{4}/g)!.join(' ');
}

/**
 * Ensures a given callback is called at most once per invocation with a given key.
 * For example:
 *  foo('bar', () => console.log(1));
 *  foo('bar', () => console.log(2));
 * Would print: 1
 */
let calls = new Set<string>();
export function once(key: string, callback: () => void) {
  if (calls.has(key)) {
    return;
  }
  calls.add(key);
  callback();
}
export function resetOnce() {
  calls = new Set<string>();
}

/**
 * Constructs a URL with UTM parameters appended to the query string.
 *
 * @param {string} pathname - The base URL path.
 * @param {'mozilla-websites' | 'product-partnership'} utmMedium - The medium through which the link is being shared.
 * @param {'moz-account'} utmSource - The source of the traffic.
 * @param {'bento' | 'sidebar'} utmTerm - The search term or keyword associated with the campaign.
 * @param {'fx-desktop' | 'fx-mobile' | 'monitor' | 'monitor-free' | 'monitor-plus' | 'relay' | 'vpn'} utmContent - The specific content or product that the link is associated with.
 * @param {'permanent' | 'settings-promo' | 'connect-device'} utmCampaign - The name of the marketing campaign.
 * @returns {string} - The constructed URL with UTM parameters.
 */
export const constructHrefWithUtm = (
  pathname: string,
  utmMedium: 'mozilla-websites' | 'product-partnership',
  utmSource: 'moz-account',
  utmTerm: 'bento' | 'sidebar',
  utmContent:
    | 'fx-desktop'
    | 'fx-mobile'
    | 'monitor'
    | 'monitor-free'
    | 'monitor-plus'
    | 'relay'
    | 'vpn',
  utmCampaign: 'permanent' | 'settings-promo' | 'connect-device'
) => {
  return `${pathname}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_term=${utmTerm}&utm_content=${utmContent}&utm_campaign=${utmCampaign}`;
};
