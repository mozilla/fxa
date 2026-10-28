/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class StrapiClientConfig {
  @IsUrl({ require_tld: false })
  public readonly graphqlApiUri!: string;

  @IsString()
  public readonly apiKey!: string;

  @Type(() => Number)
  @IsNumber()
  public readonly memCacheTTL?: number;

  @IsString()
  public readonly firestoreCacheCollectionName!: string;

  @Type(() => Number)
  @IsNumber()
  public readonly firestoreCacheTTL?: number;

  @Type(() => Number)
  @IsNumber()
  public readonly firestoreOfflineCacheTTL?: number;

  @IsOptional()
  @IsString()
  public readonly webhookSecret?: string;
}
