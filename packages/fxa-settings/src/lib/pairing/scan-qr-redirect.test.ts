/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReactUtils from 'fxa-react/lib/utils';
import GleanMetrics from '../glean';
import { flushGlean } from '../glean/flush';
import { goToScanQr } from './scan-qr-redirect';

jest.mock('../glean', () => ({
  __esModule: true,
  default: { cadFireFox: { scanQrRedirect: jest.fn() } },
}));
jest.mock('../glean/flush', () => ({ flushGlean: jest.fn() }));

describe('goToScanQr', () => {
  let hardNavigate: jest.SpyInstance;
  let flush: Promise<void>;

  beforeEach(() => {
    window.history.replaceState({}, '', '/connect_another_device?x=1');
    hardNavigate = jest
      .spyOn(ReactUtils, 'hardNavigate')
      .mockImplementation(() => {});
    flush = Promise.resolve();
    (flushGlean as jest.Mock).mockReturnValue(flush);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records the event and redirects after the flush', async () => {
    goToScanQr('password_login');
    expect(GleanMetrics.cadFireFox.scanQrRedirect).toHaveBeenCalledWith({
      event: { reason: 'password_login' },
    });
    expect(hardNavigate).not.toHaveBeenCalled();

    await flush;

    expect(hardNavigate).toHaveBeenCalledWith(
      '/pair/authority/scan_qr',
      {},
      true
    );
  });

  it('skips the redirect when the user leaves during the flush', async () => {
    goToScanQr();
    window.history.replaceState({}, '', '/settings');

    await flush;

    expect(hardNavigate).not.toHaveBeenCalled();
  });
});
