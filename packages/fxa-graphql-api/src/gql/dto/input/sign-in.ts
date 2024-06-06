/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, InputType } from '@nestjs/graphql';
import { MetricsContext } from './metrics-context';

@InputType()
export class SignInOptionsInput {
  @Field({ nullable: true })
  public keys?: boolean;

  @Field({ nullable: true })
  public service?: string;

  @Field({ nullable: true })
  public reason?: string;

  @Field({ nullable: true })
  public redirectTo?: string;

  @Field({ nullable: true })
  public resume?: string;

  @Field({ nullable: true })
  public verificationMethod?: string;

  @Field({ nullable: true })
  public unblockCode?: string;

  @Field({ nullable: true })
  public originalLoginEmail?: string;

  @Field({ nullable: true })
  public skipCaseError?: boolean;

  @Field(() => MetricsContext, { nullable: true })
  public metricsContext?: MetricsContext;
}

@InputType()
export class SignInInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field((type) => String)
  public authPW!: hexstring;

  @Field()
  public email!: string;

  @Field({ nullable: true })
  public authPWVersion?: number;

  @Field()
  public options!: SignInOptionsInput;
}
