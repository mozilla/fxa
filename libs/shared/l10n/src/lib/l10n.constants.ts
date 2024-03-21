/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
export const DEFAULT_LOCALE = 'en';

/*
 * These do not exist in the l10n repo, but we want users with these locales to
 * receive the 'en-GB' translations to see 'US $x.xx' instead of the en fallback '$x.xx'
 * which is ambiguous.
 */
export const EN_GB_LOCALES = ['en-NZ', 'en-SG', 'en-MY'];
