/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomsModule } from '@fxa/shared/nestjs/customs';
import { AuthClientFactory } from '../backend/auth-client.service';
import { BackendModule } from '../backend/backend.module';
import { SessionTokenStrategy } from './session-token.strategy';

@Module({
  imports: [
    BackendModule,
    CustomsModule,
    PassportModule.register({ defaultStrategy: 'bearer' }),
  ],
  providers: [AuthClientFactory, SessionTokenStrategy],
})
export class AuthModule {}
