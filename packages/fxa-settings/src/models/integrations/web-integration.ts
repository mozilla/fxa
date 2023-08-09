/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseIntegration, IntegrationType } from './base-integration';
import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
  ModelValidation as V,
  ModelDataStore,
} from '../../lib/model-data';

// TODO: move this to other file, FXA-8099
export class BaseIntegrationData extends ModelDataProvider {
  @bind([V.isString])
  context: string | undefined;

  @bind([V.isString])
  email: string | undefined;

  @bind([V.isString])
  emailToHashWith: string | undefined;

  @bind([V.isString])
  entrypoint: string | undefined;

  @bind([V.isString], T.snakeCase)
  entrypointExperiment: string | undefined;

  @bind([V.isString], T.snakeCase)
  entrypointVariation: string | undefined;

  @bind([V.isBoolean], T.snakeCase)
  resetPasswordConfirm: boolean | undefined;

  @bind([V.isString])
  setting: string | undefined;

  @bind([V.isString])
  service: string | undefined;

  @bind([V.isString])
  style: string | undefined;

  @bind([V.isString])
  uid: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmCampaign: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmContent: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmMedium: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmSource: string | undefined;

  @bind([V.isString], T.snakeCase)
  utmTerm: string | undefined;
}

export class WebIntegration extends BaseIntegration {
  constructor(data: ModelDataStore) {
    super(IntegrationType.Web, new BaseIntegrationData(data));
    this.setFeatures({
      reuseExistingSession: true,
      fxaStatus: this.isFxaStatusSupported(),
    });
  }

  private isFxaStatusSupported(): boolean {
    // TODO: check if `navigator.userAgent` is firefox desktop.
    // content-server also checks for FF version 55+ but that's nearly 6 years old
    return true;
  }
}
