/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsEmail,
  IsHexadecimal,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import {
  bind,
  ModelDataProvider,
  KeyTransforms as T,
} from '../../../lib/model-data';

/**
 * This is set of all possible parameters that can be passed into FxA on entry. This class
 * is intended for validation and documentation purposes. Subsets of this class will
 * be used as needed.
 *
 * The two paths where entry is expected are /signin, /oauth/signin and the default / (ie the index page).
 */
export class ValidEntryParams extends ModelDataProvider {

  // TODO: Look up what this is used for, and if there are other allowed options.
  @IsString()
  @IsIn(['email'])
  @IsOptional()
  @bind()
  action: string = '';

  @IsString()
  @Matches(/^[a-zA-Z_0-9].*$/)
  @IsOptional()
  @bind(T.snakeCase)
  codeChallenge: string | undefined;

  // TODO - Find all valid methods
  @IsString()
  @IsIn(['S256'])
  @IsOptional()
  @bind(T.snakeCase)
  codeChallengeMethod: string | undefined;

  // TODO - There are probably a set of valid context. Look them up
  @IsString()
  @IsIn(['fx_desktop', 'oauth_webchannel_v1'])
  @IsOptional()
  @bind()
  context: string | undefined;

  // TODO - What is this used for?
  // example: pricing
  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  dataCtaPosition: string | undefined;

  // Example: b2e88f4a9a184790af2c67928c6ccf29
  // TWO_FORMS! deviceId, device_id
  @IsHexadecimal()
  @Length(32)
  @IsOptional()
  @bind()
  deviceId: string = '';
  @IsHexadecimal()
  @Length(32)
  @IsOptional()
  @bind()
  device_id: string = '';

  // TODO: Double check this works if if it's uri encoded...
  @IsEmail()
  @IsOptional()
  @bind()
  email: string = '';

  // TODO, maybe make sanctioned list
  //  'www.mozilla.org-vpn-product-page', 'preferences', 'fxa_avatar_menu','fxa%3Aenter_email'
  @IsString()
  @IsOptional()
  @bind()
  entrypoint: string | undefined;

  // TWO FORMS! flowBeginTime, flow_begin_time
  // Both forms are passed :(
  // 1741982355937
  @IsNumber()
  @IsOptional()
  @bind()
  flowBeginTime: number = 0;

  @IsNumber()
  @IsOptional()
  @bind()
  flow_begin_time: number = 0;

  // TWO FORMS! flowId, flow_id
  //d0ea2cef802e47c72c92782d49c9283438c16ce15d3c6b97acfffdba68738b65
  @IsHexadecimal()
  @Length(64)
  @IsOptional()
  @bind()
  flowId: string = '';

  @IsHexadecimal()
  @Length(64)
  @IsOptional()
  @bind()
  flow_id: string = '';

  // TODO: Check uuid version
  //'01bac9bf-3757-4cd1-964c-e2439dddd75c'
  @IsUUID()
  @IsOptional()
  @bind()
  uniqueUserId: string = '';

  // TODO: Do we want to maintain a list of valid ids?
  @IsString()
  @Matches(/sync|(^[a-fA-F0-9]{16}$)/)
  @IsOptional()
  @bind()
  service: string = '';

  // TODO: Do we actually want this? Is it used?
  @IsString()
  @IsOptional()
  @IsIn(['yes'])
  @bind()
  signin: string = '';

  @IsEmail()
  @IsOptional()
  @bind()
  prefillEmail: string | undefined;

  @IsString()
  @Matches(/^price_[a-zA-Z0-9]{24}$/)
  @IsOptional()
  @bind()
  plan: string | undefined;

  // dcdb5ae7add825d2
  @IsString()
  @IsHexadecimal()
  @Length(16)
  @IsOptional()
  clientId: string | undefined;

  // 38a6b9b3a65a1871
  @IsString()
  @Length(16)
  @IsHexadecimal()
  @IsOptional()
  @bind(T.snakeCase)
  pkceClientId: string | undefined;

  // https%3A%2F%2Fstage-123done.herokuapp.com%2Fapi%2Foauth
  @IsString()
  @IsUrl()
  @IsOptional()
  @bind(T.snakeCase)
  redirectUri: string | undefined;

  // scope - TODO Better validation
  @IsString()
  @IsOptional()
  @bind()
  scope: string | undefined;

  // JlUSU4tDd56vRJiQ93VtTj3ho0AceHgG, pkce38447-45f2eaf664c424288b50f3559f610b28c306300d8a803d96c566ff8cdde33a0a8c375a255209c98f
  @IsString()
  @IsOptional()
  @bind()
  state: string | undefined;

  // 'youtube-video', 'fx-manage-account'
  @IsString()
  @IsOptional()
  @bind((k:string) => )
  utmContent: string | undefined;

  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  utmMedium: string | undefined;

  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  utmSource: string | undefined;
}

export class IndexQueryParams extends ModelDataProvider {

  // TODO: Look up what this is used for, and if there are other allowed options.
  @IsString()
  @IsIn(['email'])
  @IsOptional()
  @bind()
  action: string = '';

  @IsString()
  @Matches(/^[a-zA-Z_0-9].*$/)
  @IsOptional()
  @bind(T.snakeCase)
  codeChallenge: string | undefined;

  // TODO - Find all valid methods
  @IsString()
  @IsIn(['S256'])
  @IsOptional()
  @bind(T.snakeCase)
  codeChallengeMethod: string | undefined;

  // TODO - There are probably a set of valid context. Look them up
  @IsString()
  @IsIn(['fx_desktop', 'oauth_webchannel_v1'])
  @IsOptional()
  @bind()
  context: string | undefined;

  // TODO - What is this used for?
  // example: pricing
  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  dataCtaPosition: string | undefined;

  // Example: b2e88f4a9a184790af2c67928c6ccf29
  // TWO_FORMS! deviceId, device_id
  @IsHexadecimal()
  @Length(32)
  @IsOptional()
  @bind()
  deviceId: string = '';
  @IsHexadecimal()
  @Length(32)
  @IsOptional()
  @bind()
  device_id: string = '';

  // TODO: Double check this works if if it's uri encoded...
  @IsEmail()
  @IsOptional()
  @bind()
  email: string = '';

  // TODO, maybe make sanctioned list
  //  'www.mozilla.org-vpn-product-page', 'preferences', 'fxa_avatar_menu','fxa%3Aenter_email'
  @IsString()
  @IsOptional()
  @bind()
  entrypoint: string | undefined;

  // TWO FORMS! flowBeginTime, flow_begin_time
  // Both forms are passed :(
  // 1741982355937
  @IsNumber()
  @IsOptional()
  @bind()
  flowBeginTime: number = 0;

  @IsNumber()
  @IsOptional()
  @bind()
  flow_begin_time: number = 0;

  // TWO FORMS! flowId, flow_id
  //d0ea2cef802e47c72c92782d49c9283438c16ce15d3c6b97acfffdba68738b65
  @IsHexadecimal()
  @Length(64)
  @IsOptional()
  @bind()
  flowId: string = '';

  @IsHexadecimal()
  @Length(64)
  @IsOptional()
  @bind()
  flow_id: string = '';

  // TODO: Check uuid version
  //'01bac9bf-3757-4cd1-964c-e2439dddd75c'
  @IsUUID()
  @IsOptional()
  @bind()
  uniqueUserId: string = '';

  // TODO: Do we want to maintain a list of valid ids?
  @IsString()
  @Matches(/sync|(^[a-fA-F0-9]{16}$)/)
  @IsOptional()
  @bind()
  service: string = '';

  // TODO: Do we actually want this? Is it used?
  @IsString()
  @IsOptional()
  @IsIn(['yes'])
  @bind()
  signin: string = '';

  @IsEmail()
  @IsOptional()
  @bind()
  prefillEmail: string | undefined;

  @IsString()
  @Matches(/^price_[a-zA-Z0-9]{24}$/)
  @IsOptional()
  @bind()
  plan: string | undefined;

  // dcdb5ae7add825d2
  @IsString()
  @IsHexadecimal()
  @Length(16)
  @IsOptional()
  clientId: string | undefined;

  // 38a6b9b3a65a1871
  @IsString()
  @Length(16)
  @IsHexadecimal()
  @IsOptional()
  @bind(T.snakeCase)
  pkceClientId: string | undefined;

  // https%3A%2F%2Fstage-123done.herokuapp.com%2Fapi%2Foauth
  @IsString()
  @IsUrl()
  @IsOptional()
  @bind(T.snakeCase)
  redirectUri: string | undefined;

  // scope - TODO Better validation
  @IsString()
  @IsOptional()
  @bind()
  scope: string | undefined;

  // JlUSU4tDd56vRJiQ93VtTj3ho0AceHgG, pkce38447-45f2eaf664c424288b50f3559f610b28c306300d8a803d96c566ff8cdde33a0a8c375a255209c98f
  @IsString()
  @IsOptional()
  @bind()
  state: string | undefined;

  // 'youtube-video', 'fx-manage-account'
  @IsString()
  @IsOptional()
  @bind((k:string) => )
  utmContent: string | undefined;

  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  utmMedium: string | undefined;

  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  utmSource: string | undefined;
}
