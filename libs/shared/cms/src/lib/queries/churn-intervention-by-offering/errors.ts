/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class ChurnInterventionByOfferingOfferingCountError extends Error {
  constructor(count: number) {
    super(
      `Unexpected number of offerings found for product and inverval. Expected 0 or 1, found ${count}.`
    );
  }
}
export class ChurnInterventionByOfferingChurnInterventionsCountError extends Error {
  constructor(count: number) {
    super(
      `Unexpected number of churn interventions found for offering. Expected 1, found ${count}.`
    );
  }
}
