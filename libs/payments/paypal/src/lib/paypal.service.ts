/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { PayPalManager } from './paypal.manager';

@Injectable()
export class PayPalService {
  constructor(private paypalManager: PayPalManager) {}
}
