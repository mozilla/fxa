/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEmail, IsOptional } from 'class-validator';
import { bind, ModelDataProvider } from '../../../lib/model-data';

export class IndexQueryParams extends ModelDataProvider {
  @IsEmail()
  @IsOptional()
  @bind()
  email: string = '';
}
