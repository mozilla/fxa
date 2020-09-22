/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { AccountResolver } from './account/account.resolver';
import { EmailBounceResolver } from './email-bounce/email-bounce.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AccountResolver, EmailBounceResolver],
})
export class GqlModule {}
