/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
  ModelValidation as V,
} from '../../lib/model-data';

export class ResumeObj extends ModelDataProvider {
  @bind([V.isAccessType], T.snakeCase)
  accessType: string | undefined;

  @bind([V.isString], T.snakeCase)
  acrValues: string | undefined;

  @bind([V.isAction], T.snakeCase)
  action: string | undefined;

  @bind([V.isClientId], T.snakeCase)
  clientId: string | undefined;

  @bind([V.isCodeChallenge], T.snakeCase)
  codeChallenge: string | undefined;

  @bind([V.isCodeChallengeMethod], T.snakeCase)
  codeChallengeMethod: string | undefined;

  @bind([V.isPrompt])
  prompt: string | undefined;

  @bind([V.isUri])
  redirectUri: string | undefined;

  @bind([V.isNonEmptyString])
  scope: string | undefined;

  @bind([V.isClientId])
  service: string | undefined;

  @bind([V.isNonEmptyString])
  state: string | undefined;
}
