/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { GqlAllowlist } from './gql-allowlist';

describe('Gql Allowlist', () => {
  let allowlist: GqlAllowlist;

  function runGuard({ body = {}, query = {} }) {
    return allowlist.allowed({
      body,
      query,
    });
  }

  beforeEach(async () => {
    allowlist = new GqlAllowlist({
      allowlist: ['nestjs/gql/example-allowlist.json'],
      enabled: true,
    });
  });

  it('should be defined', () => {
    expect(allowlist).toBeDefined();
  });

  it('should have parsed allowlist', () => {
    expect(allowlist.valid).toBeDefined();
    expect(allowlist.valid.length).toBeGreaterThan(0);
    expect(Object.keys(allowlist.valid[0]).length).toBeGreaterThan(0);
  });

  it('allowsValid query', () => {
    const body = {
      query: 'query GetUid {\n  account {\n    uid\n  }\n}\n',
    };
    expect(runGuard({ body })).toBeTruthy();
  });

  it('denies invalid query', () => {
    const body = {
      query:
        'query GetRecoveryKeyExists {\n  account {\n    totp {\n      exists\n      verified\n    }\n  }\n}\n',
    };
    expect(runGuard({ body })).toBeFalsy();
  });
});
