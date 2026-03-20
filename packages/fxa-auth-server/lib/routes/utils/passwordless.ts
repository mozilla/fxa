/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface PasswordlessClientConfig {
  allowedServices: string[];
}

export type AllowedClientServices = Record<string, PasswordlessClientConfig>;

/**
 * Checks if a client is allowed to use passwordless authentication for a specific service.
 *
 * @param allowedClientServices - Map of clientId to their allowed services configuration
 * @param clientId - The OAuth client ID
 * @param service - The service being requested (from metricsContext)
 * @returns true if the client is allowed for the service, false otherwise
 *
 * Behavior:
 * - If clientId is not in config: deny
 * - If clientId is in config but no service specified: allow only if allowedServices includes "*"
 * - If allowedServices is empty array: deny all services
 * - If allowedServices includes "*": allow all services
 * - Otherwise: check if service is in allowedServices array
 */
export function isClientAllowedForPasswordless(
  allowedClientServices: AllowedClientServices,
  clientId?: string,
  service?: string
): boolean {
  if (!clientId) {
    return false;
  }

  const clientConfig = allowedClientServices?.[clientId];

  if (!clientConfig) {
    return false; // Client not in allowlist
  }

  const allowedServices = clientConfig.allowedServices;

  // Validate that allowedServices is an array of strings; otherwise deny by default
  if (
    !Array.isArray(allowedServices) ||
    !allowedServices.every((s) => typeof s === 'string')
  ) {
    return false;
  }

  // Empty array denies all services
  if (allowedServices.length === 0) {
    return false;
  }

  // Support wildcard for "all services"
  if (allowedServices.includes('*')) {
    return true;
  }

  // If no service specified in request, deny (require explicit wildcard)
  if (!service) {
    return false;
  }

  // Check if service is in the allowed list
  return allowedServices.includes(service);
}

/**
 * Existing passwordless accounts (verifierSetAt === 0 and no linked accounts)
 * are always eligible, regardless of the feature flag. The flag only gates new
 * signups. Third-party auth accounts also have verifierSetAt === 0 but should
 * use their linked provider, not passwordless OTP.
 */
export function isPasswordlessEligible(
  account: { verifierSetAt: number; linkedAccounts?: unknown[] } | null,
  email: string,
  featureEnabled: boolean
): boolean {
  // Existing passwordless accounts are always eligible, but not third-party
  // auth accounts which also have verifierSetAt === 0
  if (account?.verifierSetAt === 0 && !account.linkedAccounts?.length) {
    return true;
  }
  // Flag gates new signups and is required for non-passwordless accounts
  if (!featureEnabled) {
    return false;
  }
  // New account (doesn't exist yet) — eligible; existing with password — not
  return !account;
}

