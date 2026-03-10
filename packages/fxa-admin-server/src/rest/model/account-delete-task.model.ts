/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

export enum AccountDeleteStatus {
  Success = 'Success',
  Failure = 'Failure',
  NoAccount = 'No account found',
}

@ObjectType()
export class AccountDeleteResponse {
  /** Name of task held in the task queue. This can be used to get task's status later. */
  @Field({ nullable: false })
  public taskName!: string;

  /** A valid account email or UID */
  @Field({ nullable: false })
  public locator!: string;

  /** A short status message. */
  @Field({ nullable: false })
  status!: AccountDeleteStatus;
}

@ObjectType()
export class AccountDeleteTaskStatus {
  /** Name of task held in the task queue.. */
  @Field({ nullable: false })
  public taskName!: string;

  /** A short status message. */
  @Field({ nullable: false })
  status!: string;
}
