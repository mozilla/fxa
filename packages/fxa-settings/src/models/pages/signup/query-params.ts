/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsBoolean, IsEmail, IsOptional } from 'class-validator';
import { bind, ModelDataProvider } from '../../../lib/model-data';

export class SignupQueryParams extends ModelDataProvider {
  // 'email' will be optional once the index page is converted to React
  // and we pass it with router-state instead of a param
  @IsEmail()
  @IsOptional()
  @bind()
  email: string = '';

  // When we get rid of Backbone email-first or React email-first has been
  // rolled out for a while (to ensure we won't turn the feature off), this
  // `emailStatusChecked` can be removed
  @IsOptional()
  @IsBoolean()
  @bind()
  emailStatusChecked: boolean = false;
}
