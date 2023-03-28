/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  ModelDataProvider,
  ModelValidation as V,
} from '../../../lib/model-data';

export class CompleteResetPasswordLink extends ModelDataProvider {
  // TODO: change `isNonEmptyString` to `email` when validation is properly set up.
  // This is temporary for tests/Storybook so that `email=''` shows a damaged link
  @bind([V.isNonEmptyString, V.isRequired])
  email: string = '';

  // TODO: add @bind `isEmail` when validation is properly set up.
  // This should be _optional_ but when this exists it should be an email.
  emailToHashWith: string = '';

  @bind([V.isNonEmptyString, V.isRequired])
  code: string = '';

  @bind([V.isHex, V.isRequired])
  token: string = '';
}
