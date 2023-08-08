/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Fields available in each newsletter:
 * - `label` is the label shown to the user.
 * - `slug` is the id passed to Basket
 * - 'ftlId' is the string id for localization
 */
export type Newsletter = {
  label: string;
  slug: string[];
  ftlId: string;
};

export const newsletters: Newsletter[] = [
  {
    label: 'Security & privacy news and updates',
    slug: ['security-privacy-news', 'mozilla-accounts'],
    ftlId: 'choose-newsletters-option-security-privacy',
  },
  {
    label: 'Early access to test new products',
    slug: ['test-pilot'],
    ftlId: 'choose-newsletters-option-test-pilot',
  },
  {
    label: 'Help keep the internet healthy',
    slug: ['take-action-for-the-internet'],
    ftlId: 'choose-newsletters-option-take-action-for-the-internet-2',
  },
];
