/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

type ServiceScopes = Record<string, string[]>;

/**
 * ADR 0049 scope resolution. Returns the full scope set granted when
 * the /oauth/authorization client omits scope= and provides service=.
 * When `withKeys` is true (request carried keysJwe — user entered a
 * password and the client wrapped scoped keys), append the keys-
 * conditional scope so non-Sync Firefox flows that entered a password
 * pick up Sync. Dedupes when the base set already contains it.
 * Returns undefined when the service has no configured scope set.
 */
function resolveScopesForService(
  serviceScopes: ServiceScopes,
  keysConditionalScope: string,
  serviceName: string,
  withKeys: boolean
): string[] | undefined {
  const base = serviceScopes[serviceName];
  if (!base) {
    return undefined;
  }
  if (!withKeys || base.includes(keysConditionalScope)) {
    return base;
  }
  return [...base, keysConditionalScope];
}

export = resolveScopesForService;
