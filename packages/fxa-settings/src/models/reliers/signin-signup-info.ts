/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
  ModelValidation as V,
} from '../../lib/model-data';

// Sign inflow
// params listed in:
// https://mozilla.github.io/ecosystem-platform/api#tag/OAuth-Server-API-Overview

export class SignInSignUpInfo extends ModelDataProvider {
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

  @bind([V.isKeysJwk], T.snakeCase)
  keysJwk: string | undefined;

  @bind([V.isIdToken], T.snakeCase)
  idTokenHint: string | undefined;

  @bind([V.isEmail], T.snakeCase)
  loginHint: string | undefined;

  @bind([V.isGreaterThanZero], T.snakeCase)
  maxAge: number | undefined;

  @bind([V.isPrompt])
  prompt: string | undefined;

  @bind([V.isPairingAuthorityRedirectUri], T.snakeCase)
  redirectUri: string | undefined;

  @bind([V.isUrl], T.snakeCase)
  redirectTo: string | undefined;

  @bind([V.isBoolean], T.snakeCase)
  returnOnError: boolean | undefined;

  @bind([V.isNonEmptyString])
  scope: string | undefined;

  @bind([V.isNonEmptyString])
  state: string | undefined;

  @bind([V.isEmail])
  email: string | undefined;
}
