/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect } from 'chai';
import 'mocha';

import { sqlOperation, sqlTable } from '../../db';

describe('sqlOperation', () => {
  it('returns the leading verb, lowercased, for known statements', () => {
    expect(sqlOperation('SELECT * FROM accounts')).to.equal('select');
    expect(sqlOperation('  insert into emails values (?)')).to.equal('insert');
    expect(sqlOperation('UPDATE devices SET x=1')).to.equal('update');
    expect(sqlOperation('delete from tokens')).to.equal('delete');
    expect(sqlOperation('Call accountRecord_10(?)')).to.equal('call');
    expect(sqlOperation('REPLACE INTO x')).to.equal('replace');
  });

  it('returns "other" for unknown verbs, empty, or non-string input', () => {
    expect(sqlOperation('EXPLAIN SELECT 1')).to.equal('other');
    expect(sqlOperation('')).to.equal('other');
    expect(sqlOperation(undefined)).to.equal('other');
    expect(sqlOperation(123 as any)).to.equal('other');
  });

  it('never leaks raw SQL (only a bounded label)', () => {
    const bounded = new Set([
      'select',
      'insert',
      'update',
      'delete',
      'replace',
      'call',
      'other',
    ]);
    expect(bounded.has(sqlOperation('SELECT secret FROM users WHERE id=42'))).to
      .be.true;
  });
});

describe('sqlTable', () => {
  it('extracts the primary table from the real accountAuthorizations queries', () => {
    expect(
      sqlTable(
        'SELECT uid, scope FROM accountAuthorizations WHERE uid=? AND scope=? AND service=?'
      )
    ).to.equal('accountAuthorizations');
    expect(
      sqlTable(
        'INSERT INTO accountAuthorizations (uid, scope, service) VALUES (?,?,?)'
      )
    ).to.equal('accountAuthorizations');
    expect(sqlTable('DELETE FROM accountAuthorizations WHERE uid=?')).to.equal(
      'accountAuthorizations'
    );
  });

  it('handles UPDATE and backticked identifiers', () => {
    expect(sqlTable('UPDATE clients SET name=? WHERE id=?')).to.equal('clients');
    expect(sqlTable('SELECT * FROM `tokens` WHERE id=?')).to.equal('tokens');
  });

  it('returns "unknown" when no table is parseable or input is non-string', () => {
    expect(sqlTable('SELECT GET_LOCK(?, ?) AS acquired')).to.equal('unknown');
    expect(sqlTable('')).to.equal('unknown');
    expect(sqlTable(undefined)).to.equal('unknown');
  });
});
