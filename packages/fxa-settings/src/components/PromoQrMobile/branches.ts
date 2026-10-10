/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import controlQr from './qr/control.svg';
import defaultQr from './qr/default.png';
import treatmentAQr from './qr/treatment-a.svg';
import treatmentBQr from './qr/treatment-b.svg';
import treatmentCQr from './qr/treatment-c.svg';
import treatmentDQr from './qr/treatment-d.svg';
import treatmentEQr from './qr/treatment-e.svg';
import treatmentFQr from './qr/treatment-f.svg';
import treatmentGQr from './qr/treatment-g.svg';
import treatmentHQr from './qr/treatment-h.svg';

export const CONTROL_BRANCH = 'control';

export type PromoQrBranch = {
  /** Literal FTL id. Declared in en.ftl so the l10n extraction finds it. */
  ftlId: string;
  /** English fallback, kept in sync with en.ftl. */
  heading: string;
  /** Each branch scans to its own Bitly link, so the QR identifies the branch. */
  qr: string;
};

export const BRANCHES: Record<string, PromoQrBranch> = {
  [CONTROL_BRANCH]: {
    ftlId: 'promo-qr-mobile-heading',
    heading: 'Your phone. Your rules.',
    qr: controlQr,
  },
  'treatment-a': {
    ftlId: 'promo-qr-mobile-heading-treatment-a',
    heading: 'Pick up where you left off, wherever you go',
    qr: treatmentAQr,
  },
  'treatment-b': {
    ftlId: 'promo-qr-mobile-heading-treatment-b',
    heading: 'Your tabs and more, ready on your phone',
    qr: treatmentBQr,
  },
  'treatment-c': {
    ftlId: 'promo-qr-mobile-heading-treatment-c',
    heading: 'The browser you trust, on your phone',
    qr: treatmentCQr,
  },
  'treatment-d': {
    ftlId: 'promo-qr-mobile-heading-treatment-d',
    heading: 'Same Firefox. Different screen.',
    qr: treatmentDQr,
  },
  'treatment-e': {
    ftlId: 'promo-qr-mobile-heading-treatment-e',
    heading: 'Your privacy shouldn’t stop here',
    qr: treatmentEQr,
  },
  'treatment-f': {
    ftlId: 'promo-qr-mobile-heading-treatment-f',
    heading: 'Keep more of your browsing to yourself',
    qr: treatmentFQr,
  },
  'treatment-g': {
    ftlId: 'promo-qr-mobile-heading-treatment-g',
    heading: 'Your phone could use a little less noise',
    qr: treatmentGQr,
  },
  'treatment-h': {
    ftlId: 'promo-qr-mobile-heading-treatment-h',
    heading: 'Take a calmer way to browse with you',
    qr: treatmentHQr,
  },
};

export type ResolvedBranch = PromoQrBranch & { slug: string };

/** Shown outside the experiment, so only enrolled control users scan the control QR. */
export const DEFAULT_PROMO: PromoQrBranch = {
  ftlId: 'promo-qr-mobile-heading',
  heading: 'Your phone. Your rules.',
  qr: defaultQr,
};

/**
 * Resolve a branch slug to its copy and QR code. An unknown slug returns null,
 * so a typo in Experimenter shows the default promo and reports no branch.
 */
export function resolveBranch(slug?: string | null): ResolvedBranch | null {
  // Own keys only, so a slug like `toString` cannot resolve to a prototype member.
  return slug && Object.prototype.hasOwnProperty.call(BRANCHES, slug)
    ? { ...BRANCHES[slug], slug }
    : null;
}
