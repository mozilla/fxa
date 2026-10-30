/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString, IsUrl } from 'class-validator';

export class ProfileClientConfig {
  @IsUrl({ require_tld: false })
  public readonly url!: string;

  @IsString()
  public readonly secretBearerToken!: string;

  @IsString()
  public readonly serviceName!: string;
}
