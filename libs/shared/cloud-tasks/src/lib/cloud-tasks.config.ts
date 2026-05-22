/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CloudTasksCredentialsConfig {
  @IsString()
  @IsOptional()
  public readonly keyFilename: string = '';
}

export class CloudTasksOidcConfig {
  @IsString()
  @IsOptional()
  public readonly aud: string = '';

  @IsString()
  @IsOptional()
  public readonly serviceAccountEmail: string = '';
}

/**
 * Class-validator companion to the runtime `CloudTasksConfig` type in
 * `cloud-tasks.types.ts`. Use this (or extend it) when wiring Cloud Tasks
 * into a Nest app whose config is loaded via `nest-typed-config` /
 * class-transformer rather than convict.
 *
 * Instances structurally satisfy `CloudTasksConfig['cloudTasks']` so they
 * can be wrapped (`{ cloudTasks: instance }`) and handed to a `CloudTasks`
 * subclass without typecasts.
 */
export class CloudTasksBaseConfig {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  public readonly useLocalEmulator: boolean = false;

  @IsString()
  @IsOptional()
  public readonly projectId: string = '';

  @IsString()
  @IsOptional()
  public readonly locationId: string = '';

  @Type(() => CloudTasksCredentialsConfig)
  @ValidateNested()
  @IsOptional()
  public readonly credentials: CloudTasksCredentialsConfig =
    new CloudTasksCredentialsConfig();

  @Type(() => CloudTasksOidcConfig)
  @ValidateNested()
  @IsOptional()
  public readonly oidc: CloudTasksOidcConfig = new CloudTasksOidcConfig();
}
