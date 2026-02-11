/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SP2RedirectConfig } from '../sp2map.config';

export function determineRedirectToSp2(
  config: SP2RedirectConfig,
  offeringId: string,
  randomPercentage: number,
  reportError: (...args: any) => void,
  versionOverride?: string | null
) {
  // If version override is provided, short circuit return
  if (versionOverride === '2') {
    return true;
  } else if (versionOverride === '3') {
    return false;
  }

  const configPercentage = config.offerings[offeringId]?.sp2RedirectPercentage;
  const sp2RedirectPercentage =
    configPercentage ?? config.defaultRedirectPercentage;

  // Each offering should have a value indicating which percentage
  // of traffic should redirect to SP2. If config is not found, then
  // report the error.
  if (!configPercentage) {
    reportError('No SP2 redirect percentage found for offering', {
      offeringId,
    });
  }

  let validPercentage;
  if (randomPercentage < 1) {
    console.log('Random percentage is too low');
    validPercentage = 1;
  } else if (randomPercentage > 100) {
    console.log('Random percentage is too high');
    validPercentage = 100;
  } else {
    validPercentage = randomPercentage;
  }

  // sp2RedirectPercentage indicates the percentage of traffic that
  // should be redirected to SP2.
  // validPercentage is a random number between 1 and 100
  if (validPercentage <= sp2RedirectPercentage) {
    return true;
  } else {
    return false;
  }
}
