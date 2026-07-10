/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This function was moved to a separate file for easier mocking.

const EMAIL_VALIDATION_ENDPOINT = '/validate-email-domain';

export class DomainValidationError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'DomainValidationError';
    this.status = status;
  }
}

export async function resolveDomain(domain: string) {
  const response = await fetch(
    `${EMAIL_VALIDATION_ENDPOINT}?domain=${domain}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (!response.ok) {
    throw new DomainValidationError(
      `Failed to check domain ${domain}: ${response.status} ${response.statusText}`,
      response.status
    );
  }
  return response.json();
}