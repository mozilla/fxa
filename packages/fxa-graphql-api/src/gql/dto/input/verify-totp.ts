/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';
import { MetricsContext } from './metrics-context';

@InputType()
export class VerifyTotpInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ description: 'The TOTP code to check' })
  public code!: string;

  @Field({ nullable: true })
  public service?: string;

  @Field(() => MetricsContext, { nullable: true })
  public metricsContext?: MetricsContext;
}
