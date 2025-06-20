/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class StrapiFetchError extends Error {
  constructor(
    public readonly clientId: string,
    public readonly entrypoint: string
  ) {
    super(`Failed to fetch Strapi config for clientId: ${clientId}, entrypoint: ${entrypoint}.`);
  }
}


export class StrapiConfigNotFoundError extends Error {
  constructor(
    public readonly clientId: string,
    public readonly entrypoint: string
  ) {
    super(`No configuration found for clientId: ${clientId}, entrypoint: ${entrypoint}.`);
  }
}

export class CMSConfigFetchError extends Error {
  constructor(
    public readonly clientId: string,
    public readonly entrypoint: string,
    public readonly cause?: Error
  ) {
    super(`Failed to fetch CMS config from Redis for clientId: ${clientId}, entrypoint: ${entrypoint}.`);
    if (cause) {
      this.message += ` Cause: ${cause.message}`;
    }
  }
}