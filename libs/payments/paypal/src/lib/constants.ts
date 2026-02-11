/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const PAYPAL_SANDBOX_BASE = 'https://api-3t.sandbox.paypal.com';
export const PAYPAL_SANDBOX_IPN_BASE = 'https://ipnpb.sandbox.paypal.com';
export const PAYPAL_LIVE_BASE = 'https://api-3t.paypal.com';
export const PAYPAL_LIVE_IPN_BASE = 'https://ipnpb.paypal.com';
export const PAYPAL_NVP_ROUTE = '/nvp';
export const PAYPAL_IPN_ROUTE = '/cgi-bin/webscr';
export const PAYPAL_SANDBOX_API = PAYPAL_SANDBOX_BASE + PAYPAL_NVP_ROUTE;
export const PAYPAL_LIVE_API = PAYPAL_LIVE_BASE + PAYPAL_NVP_ROUTE;
export const PAYPAL_SANDBOX_IPN = PAYPAL_SANDBOX_IPN_BASE + PAYPAL_IPN_ROUTE;
export const PAYPAL_LIVE_IPN = PAYPAL_LIVE_IPN_BASE + PAYPAL_IPN_ROUTE;
// See https://developer.paypal.com/docs/checkout/reference/upgrade-integration/#nvp-integrations
// for information on when to use PLACEHOLDER_URL
export const PLACEHOLDER_URL = 'https://www.paypal.com/checkoutnow/error';
export const PAYPAL_VERSION = '204';
export const L_LIST = /L_([A-Z]+)(\d+)$/;
