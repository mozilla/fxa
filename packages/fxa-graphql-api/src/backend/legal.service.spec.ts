/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LegalService } from './legal.service';

async function mockFetch(input: RequestInfo, init?: RequestInit) {
  const resp = new Response();

  if (typeof input === 'string' || input instanceof URL) {
    const url = typeof input === 'string' ? input : input.toString();

    if (
      url.includes(
        '/settings/legal-docs/firefox_cloud_services_tos_locales.json'
      )
    ) {
      return {
        ...resp,
        ok: true,
        json: async () => ['en', 'es'],
      };
    }

    if (url.includes('en/firefox_cloud_services_tos')) {
      return {
        ...resp,
        ok: true,
        text: async () => '# Firefox Cloud Services: Terms of Service',
      };
    }
    if (url.includes('es/firefox_cloud_services_tos')) {
      return {
        ...resp,
        ok: true,
        text: async () => '# Firefox Cloud Services: Condiciones del servicio',
      };
    }
  }

  return {
    ...resp,
    ok: true,
    text: async () => '',
  };
}

describe('#unit - LegalService', () => {
  let service: LegalService;

  beforeEach(async () => {
    jest.resetModules();

    jest.spyOn(global, 'fetch').mockImplementation(mockFetch as any);

    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest
          .fn()
          .mockReturnValue('http://localhost:3030/settings/legal-docs'),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockConfig, LegalService],
    }).compile();

    service = module.get<LegalService>(LegalService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns english doc', async () => {
    const doc = await service.getDoc('en', 'firefox_cloud_services_tos');
    expect(doc).toBeDefined();
    expect(doc.markdown).toBeDefined();
    expect(
      /# Firefox Cloud Services: Terms of Service/.test(doc.markdown)
    ).toBeTruthy();
  });

  it('returns spanish doc', async () => {
    const doc = await service.getDoc('es', 'firefox_cloud_services_tos');

    expect(doc).toBeDefined();
    expect(doc.markdown).toBeDefined();
    expect(
      /# Firefox Cloud Services: Condiciones del servicio/.test(doc.markdown)
    ).toBeTruthy();
  });

  it('returns spanish doc for unsupported dialect', async () => {
    const doc = await service.getDoc('es-ar', 'firefox_cloud_services_tos');

    expect(doc).toBeDefined();
    expect(doc.markdown).toBeDefined();
    expect(
      /# Firefox Cloud Services: Condiciones del servicio/.test(doc.markdown)
    ).toBeTruthy();
  });

  it('returns empty string for bogus doc', async () => {
    const doc = await service.getDoc('en', 'xyz');

    expect(doc).toBeDefined();
    expect(doc.markdown).toBeDefined();
    expect(doc.markdown).toEqual('');
  });

  describe('invalid files', () => {
    async function testGetDoc(fileName: string) {
      await expect(async () => {
        await service.getDoc('en', fileName);
      }).rejects.toThrow('Invalid file name');
    }

    it('rejects empty file name', async () => {
      await testGetDoc('');
    });

    it('rejects relative path like file name', async () => {
      await testGetDoc('../foo.txt');
    });

    it('rejects absolute path like file name', async () => {
      await testGetDoc('/foo/bar.txt');
    });

    it('rejects long file name', async () => {
      await testGetDoc('a'.repeat(1000));
    });
  });
});
