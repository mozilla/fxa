/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';

import { FxaOAuthJwtStrategy } from './fxa-oauth-jwt.strategy';
import { FxaOAuthVerifyStrategy } from './fxa-oauth-verify.strategy';

@Module({
  providers: [FxaOAuthJwtStrategy, FxaOAuthVerifyStrategy],
  exports: [FxaOAuthJwtStrategy, FxaOAuthVerifyStrategy],
})
export class AuthModule {}
