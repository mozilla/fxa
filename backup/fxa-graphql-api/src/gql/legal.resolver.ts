/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Args, Query, Resolver } from '@nestjs/graphql';
import { LegalInput } from './dto/input';
import { LegalDoc } from './dto/payload';
import { LegalService } from '../backend/legal.service';

@Resolver()
export class LegalResolver {
  constructor(private legalService: LegalService) {}

  @Query((returns) => LegalDoc)
  public async getLegalDoc(
    @Args('input', { type: () => LegalInput })
    input: LegalInput
  ) {
    return this.legalService.getDoc(input.locale, input.file);
  }
}
