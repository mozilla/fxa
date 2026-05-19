/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseTarget } from '../../lib/targets/base';
import { CheckoutPage } from './checkout';

export function create(page: Page, target: BaseTarget) {
  return {
    checkout: new CheckoutPage(page, target),
  };
}
