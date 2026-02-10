/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Check if a clientId is allowed to use passwordless authentication
 * @param allowedClientIds - Array of allowed client IDs. Empty array means no clients are allowed.
 * @param clientId - The client ID to check (optional)
 * @returns true if the clientId is allowed, false otherwise
 */
export function isClientAllowedForPasswordless(
  allowedClientIds: string[],
  clientId?: string
): boolean {
  // If allowedClientIds is empty, no clients are allowed
  if (!allowedClientIds || allowedClientIds.length === 0) {
    return false;
  }

  // If no clientId specified, deny
  if (!clientId) {
    return false;
  }

  // Check if clientId is in the allowed list
  return allowedClientIds.includes(clientId);
}

/**
 * Check if an account is eligible for passwordless authentication
 * An account is eligible if:
 * - It doesn't exist (new registration)
 * - The email matches the forcedEmailAddress regex (for testing)
 * - It exists but has no password set (verifierSetAt === 0)
 * 
 * @param account - The account object (null if account doesn't exist)
 * @param email - The email address
 * @param forcedEmailRegex - Regex pattern to force passwordless for specific emails (optional)
 * @returns true if the account is eligible for passwordless, false otherwise
 */
export function isPasswordlessEligible(
  account: { verifierSetAt: number } | null,
  email: string,
  forcedEmailRegex?: RegExp
): boolean {
  // New account (doesn't exist) - eligible
  if (!account) {
    return true;
  }

  // Check if email matches forced regex (for testing)
  if (forcedEmailRegex && forcedEmailRegex.test(email)) {
    return true;
  }

  // Existing account must not have a password set
  return account.verifierSetAt === 0;
}