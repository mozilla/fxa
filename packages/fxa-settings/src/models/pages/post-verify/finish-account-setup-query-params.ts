/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEmail, IsJWT, IsOptional, IsString } from 'class-validator';
import { bind, ModelDataProvider } from '../../../lib/model-data';

/**
 * Params on the `subscriptionAccountFinishSetup` email link, sent to users who
 * bought a subscription before they had a Mozilla account.
 */
export class FinishAccountSetupQueryParams extends ModelDataProvider {
  @IsJWT()
  @bind()
  token: string = '';

  @IsEmail()
  @bind()
  email: string = '';

  @IsOptional()
  @IsString()
  @bind('product_name')
  productName: string = '';
}
