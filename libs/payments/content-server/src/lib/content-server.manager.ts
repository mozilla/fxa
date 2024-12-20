/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ContentServerClient } from './content-server.client';
import { GenericError } from '@fxa/shared/error';

@GenericError()
@Injectable()
export class ContentServerManager {
  constructor(private contentServerClient: ContentServerClient) {}

  async getMetricsFlow() {
    return this.contentServerClient.getMetricsFlow();
  }
}
