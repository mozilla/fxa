/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const img = require('../lib/img');
const LocalDriver = require('../lib/img/local');

const VALID_ID = '0123456789abcdef'.repeat(2);

describe('#integration - worker', () => {
  let server: any;

  beforeAll(async () => {
    server = await require('../lib/server/worker').create();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    { label: 'not hex', id: 'not-a-hex-id' },
    { label: 'uppercase hex', id: VALID_ID.toUpperCase() },
    { label: '30 hex characters', id: 'a'.repeat(30) },
    { label: '34 hex characters', id: 'a'.repeat(34) },
  ])('rejects DELETE with an id that is $label', async ({ id }) => {
    const spy = jest.spyOn(img, 'delete');
    const res = await server.inject({ method: 'DELETE', url: '/a/' + id });
    expect(res.statusCode).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it('deletes every size for a valid id', async () => {
    const spy = jest.spyOn(img, 'delete').mockResolvedValue(undefined);
    const res = await server.inject({
      method: 'DELETE',
      url: '/a/' + VALID_ID,
    });
    expect(res.statusCode).toBe(200);
    expect(spy.mock.calls).toEqual([
      [VALID_ID + '_small'],
      [VALID_ID],
      [VALID_ID + '_large'],
    ]);
  });

  it.each([31, 30, 34])(
    'rejects POST with a %i-character hex id',
    async (n) => {
      const res = await server.inject({
        method: 'POST',
        url: '/a/' + 'a'.repeat(n),
        headers: { 'content-type': 'image/png' },
        payload: Buffer.from('x'),
      });
      expect(res.statusCode).toBe(400);
    }
  );

  it('local driver upload rejects a name with path characters', async () => {
    const writeFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementation((...args: any[]) => args[2](null));
    const driver = await LocalDriver.connect();
    await expect(driver.upload('../evil', Buffer.from('x'))).rejects.toThrow(
      'Illegal characters in key'
    );
    expect(writeFile).not.toHaveBeenCalled();
  });
});
