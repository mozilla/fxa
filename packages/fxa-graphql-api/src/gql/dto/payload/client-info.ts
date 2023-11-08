/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClientInfo {
  @Field({ description: 'Unique identifier' })
  public clientId!: string;

  @Field({ description: 'URI pointing at logo for client' })
  public imageUri!: string;

  @Field({ description: 'Human readable display name for client.' })
  public serviceName!: string;

  @Field({ description: 'Location to redirect after auth' })
  public redirectUri!: string;

  @Field({ description: 'Whether or not client is known and trusted.' })
  public trusted!: boolean;
}
