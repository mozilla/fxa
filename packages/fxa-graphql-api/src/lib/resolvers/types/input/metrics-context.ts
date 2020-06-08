/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Metrics context.' })
export class MetricsContext {
  @Field({
    description:
      "The id of the client's device record, if it has registered one.",
    nullable: true,
  })
  public deviceId?: string;

  @Field({ nullable: true })
  public entrypoint?: string;

  @Field({ nullable: true })
  public entrypointExperiment?: string;

  @Field({ nullable: true })
  public entrypointVariation?: string;

  @Field({ nullable: true })
  public flowId?: string;

  @Field({ nullable: true })
  public flowBeginTime?: number;

  @Field({ nullable: true })
  public productId?: string;

  @Field({ nullable: true })
  public planId?: string;

  @Field({ nullable: true })
  public utmCampaign?: number;

  @Field({ nullable: true })
  public utmContent?: number;

  @Field({ nullable: true })
  public utmMedium?: number;

  @Field({ nullable: true })
  public utmSource?: number;

  @Field({ nullable: true })
  public utmTerm?: number;
}
