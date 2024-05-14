/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ContentfulManager } from './contentful.manager';

@Injectable()
export class ContentfulService {
  constructor(private contentfulManager: ContentfulManager) {}

  async fetchContentfulData(offeringId: string, acceptLanguage: string) {
    const offeringResult =
      await this.contentfulManager.getPageContentForOffering(
        offeringId,
        acceptLanguage
      );

    return offeringResult.getOffering();
  }
}
