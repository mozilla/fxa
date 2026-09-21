/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import swaggerText from './swagger-text';

describe('swaggerText', () => {
  it('strips the common indentation and the blank first and last lines', () => {
    expect(swaggerText`
      one
        two
      three
    `).toBe('one\n  two\nthree');
  });

  it('inserts interpolated values', () => {
    const value = 'world';
    expect(swaggerText`
      hello ${value}
    `).toBe('hello world');
  });

  it('unescapes the template syntax', () => {
    expect(swaggerText`
      \`code\` \${notAnExpression}
    `).toBe('`code` ${notAnExpression}');
  });

  it('keeps the backslashes of a regular expression', () => {
    expect(swaggerText`
      \`/^[A-Za-z0-9-\._~]{43,128}$/\`
    `).toBe('`/^[A-Za-z0-9-\\._~]{43,128}$/`');
  });

  it('turns an escaped newline into a line break', () => {
    expect(swaggerText`
      first\nsecond
    `).toBe('first\nsecond');
  });

  it('keeps the backslash of an escaped Markdown line break', () => {
    expect(swaggerText`
      first\\nsecond
    `).toBe('first\\\nsecond');
  });

  it('keeps a literal backslash-n that comes from a value', () => {
    const value = 'a\\nb';
    expect(swaggerText`
      value: ${value}
    `).toBe('value: a\\nb');
  });

  it('keeps the indent of a line below an unindented line', () => {
    expect(swaggerText`one
      two`).toBe('one\n      two');
  });
});
