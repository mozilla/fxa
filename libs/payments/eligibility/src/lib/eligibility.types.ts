/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Used to represent offering comparison to target plan
export enum OfferingComparison {
  SAME = 'same',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
}

export type OfferingOverlapBaseResult = {
  comparison: OfferingComparison;
};

export type OfferingOverlapPlanResult = OfferingOverlapBaseResult & {
  planId: string;
};

export type OfferingOverlapProductResult = OfferingOverlapBaseResult & {
  offeringProductId: string;
};

export type OfferingOverlapResult =
  | OfferingOverlapPlanResult
  | OfferingOverlapProductResult;
