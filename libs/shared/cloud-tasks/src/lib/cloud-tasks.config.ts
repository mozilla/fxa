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
import {
  CloudTasksCredentials,
  CloudTasksOidc,
  CloudTasksSettings,
} from './cloud-tasks.types';

export class CloudTasksCredentialsConfig implements CloudTasksCredentials {
  @IsOptional()
  @IsString()
  public readonly keyFilename: string = '';
}

export class CloudTasksOidcConfig implements CloudTasksOidc {
  @IsOptional()
  @IsString()
  public readonly aud: string = '';

  @IsOptional()
  @IsString()
  public readonly serviceAccountEmail: string = '';
}

export class CloudTasksBaseConfig implements CloudTasksSettings {
  @IsOptional()
  @IsBoolean()
  public readonly useLocalEmulator: boolean = false;

  @IsOptional()
  @IsString()
  public readonly projectId: string = '';

  @IsOptional()
  @IsString()
  public readonly locationId: string = '';

  @IsOptional()
  @Type(() => CloudTasksCredentialsConfig)
  @ValidateNested()
  public readonly credentials: CloudTasksCredentialsConfig =
    new CloudTasksCredentialsConfig();

  @IsOptional()
  @Type(() => CloudTasksOidcConfig)
  @ValidateNested()
  public readonly oidc: CloudTasksOidcConfig = new CloudTasksOidcConfig();
}
