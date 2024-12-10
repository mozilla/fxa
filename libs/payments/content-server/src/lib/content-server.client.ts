/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ContentServerClientConfig } from './content-server.config';
import { MetricsFlow } from './content-server.types';

@Injectable()
export class ContentServerClient {
  private readonly url: string;
  constructor(private contentServerClientConfig: ContentServerClientConfig) {
    this.url = this.contentServerClientConfig.url || 'http://localhost:3030';
  }

  public async getMetricsFlow() {
    const response = await fetch(`${this.url}/metrics-flow`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch metrics-flow');
    }
    try {
      return (await response.json()) as MetricsFlow;
    } catch {
      throw new Error('Failed to parse metrics-flow response');
    }
  }
}
