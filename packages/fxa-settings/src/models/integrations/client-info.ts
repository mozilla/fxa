/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
  ModelValidation as V,
} from '../../lib/model-data';

export class ClientInfo extends ModelDataProvider {
  @bind([V.isString, V.isHex], 'id')
  clientId: string | undefined;

  @bind([V.isString], T.snakeCase)
  imageUri: string | undefined;

  @bind([V.isString, V.isRequired], 'name')
  serviceName: string | undefined;

  @bind([V.isString], T.snakeCase)
  redirectUri: string | undefined;

  @bind([V.isBoolean])
  trusted: boolean | undefined;
}
