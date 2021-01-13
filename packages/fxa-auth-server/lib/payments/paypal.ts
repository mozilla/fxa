/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import { PayPalClient } from './paypal-client';

type PaypalHelperOptions = {
  log: Logger;
};

export class PayPalHelper {
  private log: Logger;
  private client: PayPalClient;
  private metrics: StatsD;

  constructor(options: PaypalHelperOptions) {
    this.log = options.log;
    this.client = Container.get(PayPalClient);
    this.metrics = Container.get(StatsD);
  }
}
