/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NodeRendererBindings } from './renderer/bindings-node';
import { FxaEmailRenderer } from './renderer';

describe('emails', () => {
  it('can render email', async () => {
    const r = new FxaEmailRenderer(new NodeRendererBindings());
    const email = await r.renderAdminResetAccounts({
      status: [{ locator: 'foo@mozilla.com', status: 'Success' }],
      logoAltText: 'mock-logo-alt-text',
      logoUrl: 'https://mozilla.org/mock-logo-url',
      logoWidth: '100px',
      privacyUrl: 'https://mozilla.org/mock-privacy-url',
      sync: false,
    });

    expect(email).toBeDefined();

    expect(email.subject).toEqual('Fxa Admin: Accounts Reset');
    expect(email.preview).toEqual('');

    expect(email.text).toContain("Here's the account reset status");
    expect(email.text).toContain('foo@mozilla.com - Success');
    expect(email.text).toContain('Mozilla Accounts Privacy Notice');
    expect(email.text).toContain('https://mozilla.org/mock-privacy-url');

    expect(email.html).toContain('<title>Fxa Admin: Accounts Reset</title>');
    expect(email.html).toContain("Here's the account reset status");
    expect(email.html).toContain('foo@mozilla.com');
    expect(email.html).toContain('Success');
    expect(email.html).toContain('Mozilla Accounts Privacy Notice');
    expect(email.html).toContain('https://mozilla.org/mock-privacy-url');
  });

  // TODO: Port over other tests, FXA-12579
});
