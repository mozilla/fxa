/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import request from 'supertest';
import app, { createServer } from './server';
import pkg from '../../package.json';

function expectValueNotToBeUnknown(value: string) {
  expect(value).toBeTruthy();
  expect(value).not.toBe('unknown');
}

describe('Test simple server routes', () => {
  test('routes should have correct headers', async () => {
    const response = await request(app).get('/__version__');
    expect(response.header).toMatchObject({
      'referrer-policy': 'same-origin',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-frame-options': 'DENY',
      'x-xss-protection': '1; mode=block',
      'x-content-type-options': 'nosniff',
    });
  });

  test('__version__ should have correct structure', async () => {
    const response = await request(app).get('/__version__');
    expect(response.status).toStrictEqual(200);
    expect(response.header['content-type']).toStrictEqual(
      'application/json; charset=utf-8'
    );
    const body = response.body;
    expect(Object.keys(body).sort()).toStrictEqual([
      'commit',
      'source',
      'version',
    ]);
    expectValueNotToBeUnknown(body.commit);
    expectValueNotToBeUnknown(body.source);
    expectValueNotToBeUnknown(body.version);
    expect(body.version).toStrictEqual(pkg.version);
    // check that the commit value looks like a git SHA
    expect(body.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  test('__lbheartbeat__ should return as expected', async () => {
    const response = await request(app).get('/__lbheartbeat__');
    expect(response.status).toStrictEqual(200);
    expect(response.header['content-type']).toStrictEqual(
      'text/plain; charset=utf-8'
    );
    expect(response.text).toStrictEqual('Ok');
  });
});

// Each route the client router declares must serve index.html, or a refresh returns a 404.
describe('Test client routes', () => {
  it.each([
    '/',
    '/account-search',
    '/account-delete',
    '/account-reset',
    '/relying-parties',
    '/rate-limiting',
    '/waf-tokens',
    '/permissions',
    '/domain-blocklist',
    '/email-blocklist',
    '/oauth-scopes',
  ])('%s serves index.html', async (route) => {
    const response = await request(app).get(route);
    expect(response.status).toStrictEqual(200);
    expect(response.header['content-type']).toStrictEqual(
      'text/html; charset=utf-8'
    );
    expect(response.text).toContain('<div id="root">');
  });
});

describe('createServer', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rethrows the error passed to the listen callback', async () => {
    const error = new Error('listen EADDRINUSE');
    jest
      .spyOn(app, 'listen')
      .mockImplementation(((...args: Array<(err?: Error) => void>) =>
        args[args.length - 1](error)) as unknown as typeof app.listen);
    await expect(createServer()).rejects.toBe(error);
  });
});
