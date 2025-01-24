/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
  utmSource: 'moz-account' | 'moz-subplat',
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
