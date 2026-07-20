/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { FidoMdsService } from './fido-mds.service';

const MDS_URL = 'https://mds.fidoalliance.org/';
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const mockConfigService = {
  get: (key: string) => {
    if (key === 'fidoMds') {
      return {
        url: MDS_URL,
        cacheTtlSeconds: CACHE_TTL_SECONDS,
        fetchTimeoutSeconds: 10,
      };
    }
    return undefined;
  },
};

/** Build a minimal JWT-shaped string with a base64url-encoded payload. */
function makeJwt(payload: object): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${payloadB64}.signature`;
}

const YUBIKEY_AAGUID = 'fa2b99dc-9e39-4257-8f92-4a30d23c4118';
const UNKNOWN_AAGUID = '00000000-0000-0000-0000-000000000000';

const MDS_ENTRIES = [
  {
    aaguid: YUBIKEY_AAGUID,
    metadataStatement: { description: 'YubiKey 5 Series with NFC' },
  },
  {
    aaguid: 'cb69481e-8ff7-4039-93ec-0a2729a154a8',
    metadataStatement: { description: 'YubiKey 5 FIPS Series' },
  },
];

describe('FidoMdsService', () => {
  let service: FidoMdsService;
  let mockFetch: jest.SpyInstance;

  const mockLog = {
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(makeJwt({ entries: MDS_ENTRIES })),
    } as unknown as Response);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FidoMdsService,
        { provide: MozLoggerService, useValue: mockLog },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(FidoMdsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the authenticator name for a known AAGUID', async () => {
    const name = await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(name).toBe('YubiKey 5 Series with NFC');
  });

  it('is case-insensitive for AAGUID lookup', async () => {
    const name = await service.getAuthenticatorName(
      YUBIKEY_AAGUID.toUpperCase()
    );
    expect(name).toBe('YubiKey 5 Series with NFC');
  });

  it('returns undefined for an unknown AAGUID', async () => {
    const name = await service.getAuthenticatorName(UNKNOWN_AAGUID);
    expect(name).toBeUndefined();
  });

  it('fetches the MDS only once for multiple concurrent calls', async () => {
    await Promise.all([
      service.getAuthenticatorName(YUBIKEY_AAGUID),
      service.getAuthenticatorName(YUBIKEY_AAGUID),
      service.getAuthenticatorName(YUBIKEY_AAGUID),
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does not re-fetch before TTL expires', async () => {
    await service.getAuthenticatorName(YUBIKEY_AAGUID);
    await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('re-fetches after TTL expires', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));

    await service.getAuthenticatorName(YUBIKEY_AAGUID);

    jest.setSystemTime(new Date('2023-01-10T12:00:00.000Z'));

    await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns undefined and allows retry when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));

    const name = await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(name).toBeUndefined();
    expect(mockLog.warn).toHaveBeenCalledWith(
      'FidoMdsService: fetch/parse failed',
      expect.anything()
    );

    // Next call should retry
    const retried = await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(retried).toBe('YubiKey 5 Series with NFC');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns undefined and allows retry when server returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const name = await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(name).toBeUndefined();
    expect(mockLog.warn).toHaveBeenCalled();
  });

  it('logs a cache-refreshed message with entry count on success', async () => {
    await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(mockLog.info).toHaveBeenCalledWith(
      'FidoMdsService: cache refreshed',
      { entries: MDS_ENTRIES.length }
    );
  });

  it('skips entries that are missing aaguid or description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          makeJwt({
            entries: [
              { aaguid: 'aaguid-no-description' },
              { metadataStatement: { description: 'no aaguid' } },
              ...MDS_ENTRIES,
            ],
          })
        ),
    });

    // Only the valid MDS_ENTRIES should be in the cache
    const name = await service.getAuthenticatorName(YUBIKEY_AAGUID);
    expect(name).toBe('YubiKey 5 Series with NFC');

    const missing = await service.getAuthenticatorName('aaguid-no-description');
    expect(missing).toBeUndefined();
  });
});
