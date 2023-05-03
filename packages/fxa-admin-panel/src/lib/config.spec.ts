/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { config } from './config';

describe('config', () => {
  it('gets config', () => {
    expect(config.env).toBeDefined();
    expect(config.user).toBeDefined();
    expect(config.user.email).toBeDefined();
    expect(config.user.group).toBeDefined();
    expect(config.servers).toBeDefined();
    expect(config.servers.admin).toBeDefined();
    expect(config.servers.admin.url).toBeDefined();
  });
});
