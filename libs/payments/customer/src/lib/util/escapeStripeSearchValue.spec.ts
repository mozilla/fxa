/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { escapeStripeSearchValue } from './escapeStripeSearchValue';

describe('escapeStripeSearchValue', () => {
  it('returns an ordinary value unchanged', () => {
    expect(escapeStripeSearchValue('org.mozilla.ios.FirefoxVPN')).toBe(
      'org.mozilla.ios.FirefoxVPN'
    );
  });

  it('escapes a single quote', () => {
    expect(escapeStripeSearchValue("sku_o'brien")).toBe("sku_o\\'brien");
  });

  it('escapes a backslash', () => {
    expect(escapeStripeSearchValue('sku_a\\b')).toBe('sku_a\\\\b');
  });

  it('escapes a backslash before a single quote so the quote cannot break out', () => {
    // A raw "\'" would otherwise let the value smuggle in an escaped quote;
    // the backslash must itself be escaped first.
    expect(escapeStripeSearchValue("sku_\\'")).toBe("sku_\\\\\\'");
  });

  it('returns an empty string unchanged', () => {
    expect(escapeStripeSearchValue('')).toBe('');
  });
});
