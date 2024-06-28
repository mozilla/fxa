/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsNumber, IsString, IsUrl } from 'class-validator';

export class ContentfulClientConfig {
  @IsUrl()
  public readonly cdnApiUri!: string;

  @IsUrl()
  public readonly graphqlApiUri!: string;

  @IsString()
  public readonly graphqlApiKey!: string;

  @IsString()
  public readonly graphqlSpaceId!: string;

  @IsString()
  public readonly graphqlEnvironment!: string;

  @IsString()
  public readonly firestoreCacheCollectionName!: string;

  @IsNumber()
  public readonly memCacheTTL?: number;

  @IsNumber()
  public readonly firestoreCacheTTL?: number;
}
