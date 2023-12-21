/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';
import { MetricsContext } from './metrics-context';

@InputType()
export class PasswordForgotSendCodeInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ description: 'Users email' })
  public email!: string;

  @Field((type) => MetricsContext, { nullable: true })
  public metricsContext?: MetricsContext;

  @Field({ nullable: true })
  public resume?: string;

  @Field({ nullable: true })
  public service?: string;

  @Field({ nullable: true })
  public lang?: string;

  @Field({ nullable: true })
  public redirectTo?: string;
}

@InputType()
export class PasswordForgotVerifyCodeInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ description: 'Password forgot token' })
  public token!: string;

  @Field({ description: 'Code' })
  public code!: string;
}

@InputType()
export class PasswordForgotCodeStatusInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ description: 'Password forgot token' })
  public token!: string;
}

@InputType()
export class AccountResetInputOptions {
  @Field({ nullable: true })
  public keys?: boolean;

  @Field({ nullable: true })
  public sessionToken?: boolean;
}

@InputType()
export class AccountResetInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public accountResetToken!: string;

  @Field()
  public newPasswordAuthPW!: string;

  @Field()
  public clientSalt!: string;

  @Field({ nullable: true })
  public options?: AccountResetInputOptions;
}
