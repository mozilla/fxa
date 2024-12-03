/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { AppConfig } from '../config';

/**
 * A service for basket and newsletter APIs.
 */
@Injectable()
export class BasketService {
  /** Basket config */
  private readonly config: AppConfig['newsletters'];

  private get basketUrl() {
    return `https://${this.config.basketHost}`;
  }

  private get newsLetterUrl() {
    return `https://${this.config.newsletterHost}`;
  }

  constructor(configService: ConfigService<AppConfig>) {
    const config = configService.get('newsletters');
    if (!config) {
      throw new Error('No basket api key defined!');
    }

    this.config = config;
  }

  /**
   * Locates a user token by email in basket
   * @param email
   * @returns User's token or undefined if no user is found.
   */
  async getUserToken(email: string) {
    // Check that API key was configured.
    if (!this.config.basketApiKey) {
      throw new Error('No API key configured!');
    }

    const url = getUrl(this.basketUrl, '/api/v1/users/lookup/', {
      email,
      'api-key': this.config.basketApiKey,
    });
    const resp = await fetch(url);

    if (resp.status === 200) {
      const body = await resp.json();
      return body?.token;
    }
  }

  /**
   * Unsubscribes a user from all email lists
   * @param userToken - A valid user token. Can be located with getUserToken method.
   * @returns True if request was successful.
   */
  async unsubscribeAll(userToken: string) {
    const url = getUrl(
      this.newsLetterUrl,
      `/en-US/newsletter/existing/${userToken}/`,
      {}
    );

    const params = new URLSearchParams();
    params.append('form-TOTAL_FORMS', '0');
    params.append('form-INITIAL_FORMS', '0');
    params.append('form-MIN_NUM_FORMS', '0');
    params.append('country', 'us');
    params.append('lang', 'en');
    params.append('format', 'H');
    params.append('remove_all', 'on');

    const resp = await fetch(url, {
      method: 'POST',
      body: params,
    });
    return resp?.status === 200;
  }
}

function getUrl(baseUrl: string, path: string, params: Record<string, any>) {
  const q = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${baseUrl}${path}?${q}`;
}
