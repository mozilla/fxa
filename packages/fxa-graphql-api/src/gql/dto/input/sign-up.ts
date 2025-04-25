/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, InputType } from '@nestjs/graphql';
import { BoolString } from 'fxa-auth-client';
import { MetricsContext } from './metrics-context';

@InputType()
export class SignUpOptionsInput {
  @Field({ nullable: true })
  public keys?: boolean;

  @Field({ nullable: true })
  public service!: string;

  @Field({ nullable: true })
  public redirectTo?: string;

  @Field({ nullable: true })
  public resume?: string;

  @Field({ nullable: true })
  public verificationMethod?: string;

  @Field((type) => String, { nullable: true })
  public preVerified?: BoolString;

  @Field((type) => MetricsContext, { nullable: true })
  public metricsContext?: MetricsContext;
}

@InputType()
export class SignUpInputPasswordV2 {
  @Field()
  public wrapKb!: string;

  @Field()
  public authPWVersion2!: string;

  @Field()
  public wrapKbVersion2!: string;

  @Field()
  public clientSalt!: string;
}

@InputType()
export class SignUpInput {
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
  public passwordV2?: SignUpInputPasswordV2;

  @Field()
  public options!: SignUpOptionsInput;
}
