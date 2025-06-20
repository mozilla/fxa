/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiConfigNotFoundError, StrapiFetchError } from './error';

export interface EmailFirstPage {
  headline?: string;
  description?: string;
}

export interface StrapiClientConfig {
  id: number;
  clientId: string;
  entrypoint: string;
  EmailFirstPage?: EmailFirstPage;
}

/**
 * Client class for fetching configurations from Strapi API.
 */
export class StrapiClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(strapiUrl: string, token: string) {
    try {
      new URL(strapiUrl);
    } catch {
      throw new Error('Invalid Strapi URL provided');
    }
    if (!token) {
      throw new Error('Invalid or missing token');
    }
    this.baseUrl = strapiUrl;
    this.token = token;
  }

  async fetchConfig(clientId: string, entrypoint: string): Promise<StrapiClientConfig> {
    const url = new URL(`${this.baseUrl}/api/clients`);
    const params = new URLSearchParams({
      'populate': '*',
      'filters[clientId]': clientId,
      'filters[entrypoint]': entrypoint,
    });
    url.search = params.toString();

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${this.token}`);

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new StrapiFetchError(clientId, entrypoint);
    }
    const { data: result } = await response.json() as { data: StrapiClientConfig[] };

    if (!Array.isArray(result)) {
      throw new StrapiConfigNotFoundError(clientId, entrypoint);
    }

    if (result.length === 0) {
      throw new StrapiConfigNotFoundError(clientId, entrypoint);
    }

    // We shouldn't have more than one config for a clientId and entrypoint
    // but if we do, we return the first one.
    return result[0];
  }
}
