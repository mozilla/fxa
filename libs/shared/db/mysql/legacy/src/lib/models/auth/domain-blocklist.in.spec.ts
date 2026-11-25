/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Knex } from 'knex';

import { DomainBlocklist } from './domain-blocklist';
import { defaultOpts, testDatabaseSetup } from '../../testing/helpers';

describe('DomainBlocklist (MySQL)', () => {
  let knex: Knex;

  beforeAll(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });
    await DomainBlocklist.addMany(['evil.example', 'spam.example']);
  }, 20000);

  afterAll(async () => {
    await DomainBlocklist.deleteAll();
    await knex?.destroy();
  });

  it('finds a blocked domain', async () => {
    expect(await DomainBlocklist.findByDomain('evil.example')).toBe(
      'evil.example'
    );
  });

  it('returns null for a domain that is not blocked', async () => {
    expect(await DomainBlocklist.findByDomain('safe.example')).toBeNull();
  });

  it('matches the email domain through findMatchingDomain', async () => {
    expect(await DomainBlocklist.findMatchingDomain('user@SPAM.example')).toBe(
      'spam.example'
    );
  });

  it('looks up the domain through the unique key', async () => {
    const queries: { sql: string; bindings: Knex.RawBinding[] }[] = [];
    const capture = (q: (typeof queries)[number]) => queries.push(q);
    knex.on('query', capture);
    await DomainBlocklist.findByDomain('evil.example');
    knex.off('query', capture);

    expect(queries).toHaveLength(1);
    const [{ sql, bindings }] = queries;
    const [rows] = await knex.raw(`EXPLAIN ${sql}`, bindings);
    expect(rows[0].key).toBe('uq_domainBlocklist_domain');
  });
});
