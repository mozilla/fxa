/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { checkForwardedFor } from './util';
import { ILogger } from 'fxa-shared/log';

describe('util', () => {
  let log: ILogger;
  beforeEach(() => {
    log = {
      debug: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
    } as ILogger;
  });

  it('logs no headers', async () => {
    const warnSpy = jest.spyOn(log, 'warn');
    checkForwardedFor(log, 'foo', null as unknown as Headers);
    expect(warnSpy).toBeCalledWith('checkForwardedFor', {
      msg: 'foo > headers missing!',
    });
  });

  it('logs header missing', async () => {
    const warnSpy = jest.spyOn(log, 'warn');
    const headers = new Headers();
    headers.append('foo-bar', '123');
    checkForwardedFor(log, 'foo', new Headers({}));
    expect(warnSpy).toBeCalledWith('checkForwardedFor', {
      msg: 'foo > missing x-forwarded-for header!',
    });
  });

  it('logs header value', async () => {
    const debugSpy = jest.spyOn(log, 'info');
    checkForwardedFor(
      log,
      'foo',
      new Headers({ 'x-forwarded-for': '127.0.0.77' })
    );
    expect(debugSpy).toBeCalledWith('checkForwardedFor', {
      msg: 'foo > received headers: x-forwarded-for: 127.0.0.77',
    });
  });
});
