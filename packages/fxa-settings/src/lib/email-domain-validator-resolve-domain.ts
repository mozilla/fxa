/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This function was moved to a separate file for easier mocking.

const EMAIL_VALIDATION_ENDPOINT = '/validate-email-domain';

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
    throw new Error(`Failed to check domain ${domain}: ${response.statusText}`);
  }
  return response.json();
}
