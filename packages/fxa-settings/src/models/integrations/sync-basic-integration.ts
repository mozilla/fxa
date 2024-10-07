/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  IntegrationFeatures,
  IntegrationType,
} from './base-integration';
import { bind, ModelDataStore } from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { BaseIntegrationData } from './web-integration';
import {
  IsBase64,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SyncBasicIntegrationData extends BaseIntegrationData {
  // TODO - Validation - Will @IsISO31661Alpha2() work?
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(7)
  @bind()
  country: string | undefined;

  @IsOptional()
  @IsBase64()
  @Length(8)
  @bind()
  signinCode: string | undefined;

  // TODO - Validation - Double check actions
  @IsOptional()
  @IsIn(['signin', 'signup', 'email', 'force_auth', 'pairing'])
  @bind()
  action: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  syncPreference: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  multiService: boolean | undefined;

  @IsOptional()
  @IsString()
  @bind()
  tokenCode: string | undefined;
}

export interface SyncIntegrationFeatures extends IntegrationFeatures {
  sendChangePasswordNotice: boolean;
}

type SyncIntegrationTypes =
  | IntegrationType.SyncBasic
  | IntegrationType.SyncDesktopV3;

/**
 * This integration offers basic Sync page support _without_ browser communication
 * via webchannels. Currently it is only used 1) when a user is on a verification page
 * through Sync in a different browser, which will no longer be the case once we use
 * codes for reset PW, and 2) as a base class for sync desktop v3.
 *
 * TODO in FXA-10313, let's just get rid of this now that we're on codes.
 * Move methods into SyncDesktopV3Integration.
 */
export class SyncBasicIntegration<
  T extends SyncIntegrationFeatures
> extends BaseIntegration<T> {
  constructor(
    data: ModelDataStore,
    type: SyncIntegrationTypes = IntegrationType.SyncBasic,
    features: Partial<T> = {}
  ) {
    super(type, new SyncBasicIntegrationData(data));
    this.setFeatures({
      sendChangePasswordNotice: false,
      ...features,
    });
  }

  get serviceName() {
    if (this.data.service === 'sync') {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    } else {
      return 'Firefox';
    }
  }

  wantsKeys() {
    return true;
  }

  isSync() {
    return true;
  }
}
