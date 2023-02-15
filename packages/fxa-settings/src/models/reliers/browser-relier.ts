/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bind, ContextValidation as V } from '../../lib/context';
import { ModelContext } from '../../lib/context/interfaces/model-context';
import { BaseRelier } from './base-relier';

export interface BrowserRelierData {
  country: string | undefined;
  signinCode: string | undefined;
  action: string | undefined;
  syncPreference: string | undefined;
  multiService: boolean | undefined;
  tokenCode: string | undefined;
}

export class BrowserRelier extends BaseRelier implements BrowserRelierData {
  get name() {
    return 'browser';
  }

  @bind([V.isValidCountry])
  country: string | undefined;

  @bind([V.isString])
  signinCode: string | undefined;

  @bind([V.isAction])
  action: string | undefined;

  @bind([V.isString])
  syncPreference: string | undefined;

  @bind([V.isString])
  multiService: boolean | undefined;

  @bind([V.isString])
  tokenCode: string | undefined;

  constructor(protected readonly curContext: ModelContext) {
    super(curContext);
  }

  isSync() {
    return true;
  }

  shouldOfferToSync(view: string) {
    return this.service !== 'sync' && view !== 'force-auth';
  }

  wantsKeys() {
    return true;
  }
}
