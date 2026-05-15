/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseTarget } from '../../lib/targets/base';
import { CancelPage } from './cancel';
import { CheckoutPage } from './checkout';
import { ManagePage } from './manage';
import { StaySubscribedPage } from './stay-subscribed';
import { UpgradePage } from './upgrade';

export function create(page: Page, target: BaseTarget) {
  return {
    cancel: new CancelPage(page, target),
    checkout: new CheckoutPage(page, target),
    manage: new ManagePage(page, target),
    staySubscribed: new StaySubscribedPage(page, target),
    upgrade: new UpgradePage(page, target),
  };
}
