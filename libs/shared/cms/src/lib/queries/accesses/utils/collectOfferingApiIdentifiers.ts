/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function collectOfferingApiIdentifiers(
  offerings:
    | ReadonlyArray<{ apiIdentifier?: string | null } | null | undefined>
    | null
    | undefined
): string[] {
  const out: string[] = [];
  for (const offering of offerings ?? []) {
    const id = offering?.apiIdentifier;
    if (typeof id === 'string' && id.length > 0) out.push(id);
  }
  return out;
}
