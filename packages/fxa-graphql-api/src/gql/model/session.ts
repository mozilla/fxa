/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';
import { SessionVerifiedState } from 'fxa-shared/db/models/auth/session-token';

@ObjectType({ description: 'Session (token) info' })
export class Session {
  @Field({
    description: 'Whether the current session is verified',
  })
  public verified!: boolean;
}

@ObjectType({ description: 'Session status' })
export class SessionStatus {
  @Field({
    description: 'uid of the account',
  })
  public uid!: string;

  @Field(() => String, {
    description: 'Whether the current session is verified',
  })
  public state!: SessionVerifiedState;
}
