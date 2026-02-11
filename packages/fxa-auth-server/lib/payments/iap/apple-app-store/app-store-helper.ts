/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { AppConfig, AuthLogger } from '../../../types';
import { AppStoreHelper as AppStoreHelperBase } from 'fxa-shared/payments/iap/apple-app-store/app-store-helper';

export class AppStoreHelper extends AppStoreHelperBase {
  constructor() {
    const config = Container.get(AppConfig);
    const log = Container.get(AuthLogger);

    super(config, log);
  }
}
