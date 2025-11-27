/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import type {
  ChurnInterventionEntry,
} from './churn-intervention.types';

export const ChurnInterventionEntryFactory = (
  override?: Partial<ChurnInterventionEntry>
): ChurnInterventionEntry => {
  const customerId = `cus_${faker.string.alphanumeric({ length: 24 })}`;
  const churnInterventionId = `ci_${faker.string.alphanumeric({ length: 24 })}`;
  return {
    customerId,
    churnInterventionId,
    redemptionCount: 0,
    ...override,
  };
}

export const ChurnInterventionEntryFirestoreRecordFactory = (
  override?: Partial<ChurnInterventionEntry>
): ChurnInterventionEntry => {
  return {
    ...ChurnInterventionEntryFactory(),
    ...override,
  };
}
