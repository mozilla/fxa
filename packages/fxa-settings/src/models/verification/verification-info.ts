/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  KeyTransforms,
  ModelValidation,
  ModelDataProvider,
  bind,
} from '../../lib/model-data';

export * from './verification-info';

export type VerificationInfoLinkStatus = 'expired' | 'damaged' | 'valid';

const { isEmail, isRequired, isVerificationCode, isHex, isString, isBoolean } =
  ModelValidation;
const { snakeCase } = KeyTransforms;

export class VerificationInfo extends ModelDataProvider {
  @bind([isEmail, isRequired])
  email: string = '';

  @bind([isEmail, isRequired])
  emailToHashWith: string = '';

  @bind([isVerificationCode, isRequired])
  code: string = '';

  @bind([isHex, isRequired])
  token: string = '';

  @bind([isString, isRequired])
  uid: string = '';

  @bind([isBoolean], snakeCase)
  forceAuth: boolean = false;

  @bind([isBoolean])
  lostRecoveryKey: boolean | undefined;
}
