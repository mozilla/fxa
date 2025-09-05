/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

/**
 * Extend this class to add a jwt field to an input type.
 */
@InputType({isAbstract: true})
export abstract class JwtInputWrapper {

  @Field({
    description: 'A jwt to provide access to auth server endpoints.',
    nullable: false,
  })
  public jwt!: string;

}
