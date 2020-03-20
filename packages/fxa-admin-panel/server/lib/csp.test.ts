/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from '../config';
import cspBlocking from './csp/blocking';

describe('CSP blocking rules', () => {
  // force the CDN to be enabled for tests.
  const CDN_SERVER = 'https://static.accounts.firefox.com';
  config.set('staticResources.url', CDN_SERVER);
  const { Sources, directives, reportOnly } = cspBlocking(config);

  it('does not have a Sources value equal `undefined`', () => {
    expect(Sources).not.toHaveProperty('undefined');
    expect(reportOnly).toBeFalsy();
  });

  it('has correct connectSrc directives', () => {
    const { connectSrc } = directives;

    expect(connectSrc).toHaveLength(2);
    expect(connectSrc).toContain(Sources.SELF);
    expect(connectSrc).toContain(Sources.ADMIN_SERVER);
  });

  it('has correct defaultSrc directives', () => {
    const { defaultSrc } = directives;

    expect(defaultSrc).toHaveLength(1);
    expect(defaultSrc).toContain(Sources.NONE);
  });

  it('has correct baseUri directives', () => {
    const { baseUri } = directives;

    expect(baseUri).toHaveLength(1);
    expect(baseUri).toContain(Sources.NONE);
  });

  it('has correct frameAncestors directives', () => {
    const { frameAncestors } = directives;

    expect(frameAncestors).toHaveLength(1);
    expect(frameAncestors).toContain(Sources.NONE);
  });

  it('has correct fontSrc directives', () => {
    const { fontSrc } = directives;

    expect(fontSrc).toHaveLength(2);
    expect(fontSrc).toContain(Sources.SELF);
    expect(fontSrc).toContain(Sources.CDN_URL);
  });

  it('has correct imgSrc directives', () => {
    const { imgSrc } = directives;

    expect(imgSrc).toHaveLength(2);
    expect(imgSrc).toContain(Sources.SELF);
    expect(imgSrc).toContain(Sources.CDN_URL);
  });

  it('has correct scriptSrc directives', () => {
    const { scriptSrc } = directives;

    expect(scriptSrc).toHaveLength(2);
    expect(scriptSrc).toContain(Sources.SELF);
    expect(scriptSrc).toContain(Sources.CDN_URL);
  });

  it('has correct styleSrc directives', () => {
    const { styleSrc } = directives;

    expect(styleSrc).toHaveLength(2);
    expect(styleSrc).toContain(Sources.SELF);
    expect(styleSrc).toContain(Sources.CDN_URL);
  });
});
