/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bind, ModelValidation, ModelDataProvider } from '../../lib/model-data';

const { isNonEmptyString, isRequired } = ModelValidation;

export class AccountRecoveryKeyInfo extends ModelDataProvider {
  @bind([isNonEmptyString, isRequired])
  accountResetToken: string = '';

  @bind([isNonEmptyString, isRequired])
  kB: string = '';

  @bind([isNonEmptyString, isRequired])
  recoveryKeyId: string = '';
}
