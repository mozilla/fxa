/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomsModule } from 'fxa-shared/nestjs/customs/customs.module';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';

import { AuthClientFactory } from '../backend/auth-client.service';
import { BackendModule } from '../backend/backend.module';
import { GqlCustomsGuard } from './gql-customs.guard';
import { SessionTokenStrategy } from './session-token.strategy';

@Module({
  imports: [
    BackendModule,
    CustomsModule,
    PassportModule.register({ defaultStrategy: 'bearer' }),
  ],
  providers: [
    AuthClientFactory,
    CustomsService,
    SessionTokenStrategy,
    GqlCustomsGuard,
  ],
  exports: [GqlCustomsGuard],
})
export class AuthModule {}
