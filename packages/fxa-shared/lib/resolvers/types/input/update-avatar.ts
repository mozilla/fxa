/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Field, InputType } from 'type-graphql';

@InputType()
export class UpdateAvatarInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field((type) => GraphQLUpload)
  public file!: Promise<FileUpload>;
}
