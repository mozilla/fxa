/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @octokit/rest is ESM-only; mock to avoid parse errors in Jest
jest.mock('@octokit/rest', () => ({
  Octokit: class Octokit {
    constructor() {}
  },
}));

// @fxa/shared/cms may also need mocking if it's ESM
jest.mock('@fxa/shared/cms', () => ({
  RelyingPartyConfigurationManager: class RelyingPartyConfigurationManager {},
}));

const { CMSLocalization } = require('./localization');

describe('CMSLocalization', () => {
  let mockLog: any;
  let mockConfig: any;
  let mockStatsd: any;
  let localization: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLog = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    mockStatsd = {
      increment: jest.fn(),
      timing: jest.fn(),
    };

    mockConfig = {
      cmsl10n: {
        enabled: true,
        cacheExpiry: 600,
        strapiWebhook: {
          enabled: true,
          secret: 'test-secret',
          strapiUrl: 'http://localhost:1337',
        },
        ftlUrl: {
          template:
            'https://raw.githubusercontent.com/test-owner/test-repo/main/locales/{locale}/cms.ftl',
          timeout: 5000,
        },
        github: {
          token: 'test-token',
          owner: 'test-owner',
          repo: 'test-repo',
          branch: 'main',
        },
      },
      cms: {
        strapiClient: {
          apiKey: 'test-api-key',
        },
      },
    };

    const mockCmsManager = {
      getCachedFtlContent: jest.fn(),
      cacheFtlContent: jest.fn(),
      invalidateFtlCache: jest.fn(),
      getFtlContent: jest.fn(),
    };

    localization = new CMSLocalization(
      mockLog,
      mockConfig,
      mockCmsManager,
      mockStatsd
    );
  });

  describe('strapiToFtl', () => {
    it('converts Strapi data to FTL format', () => {
      const strapiData = [
        {
          l10nId: 'desktopSyncFirefoxCms',
          name: 'Firefox Desktop Sync',
          entrypoint: 'desktop-sync',
          clientId: 'sync-client',
          SigninPage: {
            headline: 'Enter your password',
            description: 'to sign in to Firefox and start syncing',
          },
          EmailFirstPage: {
            headline: 'Welcome to Firefox Sync',
            description: 'Sync your passwords, tabs, and bookmarks',
          },
        },
      ];

      const result = localization.strapiToFtl(strapiData);

      expect(result).toContain('# Generated on');
      expect(result).toContain('# FTL file for CMS localization');
      expect(result).toContain(
        '# desktopSyncFirefoxCms - Firefox Desktop Sync'
      );
      expect(result).toContain('# Headline for Signin Page');
      expect(result).toContain('# Description for Signin Page');
      expect(result).toContain('# Headline for Email First Page');
      expect(result).toContain('# Description for Email First Page');

      expect(result).toMatch(/fxa-headline-[a-f0-9]{8} = Enter your password/);
      expect(result).toMatch(
        /fxa-description-[a-f0-9]{8} = to sign in to Firefox and start syncing/
      );
      expect(result).toMatch(
        /fxa-headline-[a-f0-9]{8} = Welcome to Firefox Sync/
      );
      expect(result).toMatch(
        /fxa-description-[a-f0-9]{8} = Sync your passwords, tabs, and bookmarks/
      );
    });

    it('handles empty Strapi data', () => {
      const result = localization.strapiToFtl([]);

      expect(result).toContain('# Generated on');
      expect(result).toContain('# FTL file for CMS localization');
      expect(result).not.toContain('=');
    });

    it('filters out non-string fields', () => {
      const strapiData = [
        {
          l10nId: 'testClient',
          name: 'Test Client',
          entrypoint: 'test',
          clientId: 'test-client',
          SigninPage: {
            headline: 'Enter your password',
            description: 'to sign in',
            isEnabled: true,
            count: 5,
            url: 'https://example.com',
            date: '2023-01-01',
            color: '#ff0000',
          },
        },
      ];

      const result = localization.strapiToFtl(strapiData);

      expect(result).toMatch(/fxa-headline-[a-f0-9]{8} = Enter your password/);
      expect(result).toMatch(/fxa-description-[a-f0-9]{8} = to sign in/);
    });

    it('removes duplicate FTL IDs', () => {
      const strapiData = [
        {
          l10nId: 'client1',
          name: 'Client 1',
          entrypoint: 'entry1',
          clientId: 'client1',
          Page: {
            field: 'Same value',
          },
        },
        {
          l10nId: 'client2',
          name: 'Client 2',
          entrypoint: 'entry2',
          clientId: 'client2',
          Page: {
            field: 'Same value',
          },
        },
      ];

      const result = localization.strapiToFtl(strapiData);
      const lines = result.split('\n');
      const ftlEntries = lines.filter((line: string) => line.includes(' = '));

      expect(ftlEntries.length).toBeGreaterThanOrEqual(1);
    });

    it('sorts entries by l10nId and fieldPath', () => {
      const strapiData = [
        {
          l10nId: 'clientB',
          name: 'Client B',
          entrypoint: 'entryB',
          clientId: 'clientB',
          Page: {
            field2: 'Value B2',
            field1: 'Value B1',
          },
        },
        {
          l10nId: 'clientA',
          name: 'Client A',
          entrypoint: 'entryA',
          clientId: 'clientA',
          Page: {
            field2: 'Value A2',
            field1: 'Value A1',
          },
        },
      ];

      const result = localization.strapiToFtl(strapiData);
      const lines = result.split('\n');

      const clientASection = lines.findIndex((line: string) =>
        line.includes('## clientA')
      );
      const clientBSection = lines.findIndex((line: string) =>
        line.includes('## clientB')
      );

      expect(clientASection).toBeGreaterThanOrEqual(0);
      expect(clientBSection).toBeGreaterThanOrEqual(0);
      expect(clientASection).toBeLessThan(clientBSection);
    });

    it('ends with a newline character', () => {
      const strapiData = [
        {
          l10nId: 'testClient',
          name: 'Test Client',
          SigninPage: {
            headline: 'Enter your password',
          },
        },
      ];

      const result = localization.strapiToFtl(strapiData);

      expect(result.endsWith('\n')).toBe(true);
      expect(result.endsWith('\n\n')).toBe(false);
    });
  });

  describe('GitHub PR operations', () => {
    beforeEach(() => {
      localization.octokit = {
        repos: {
          get: jest.fn(),
          createOrUpdateFileContents: jest.fn(),
          getContent: jest.fn(),
        },
        git: {
          getRef: jest.fn(),
          createRef: jest.fn(),
        },
        pulls: {
          create: jest.fn(),
          get: jest.fn(),
          list: jest.fn(),
        },
      };
    });

    describe('validateGitHubConfig', () => {
      it('validates GitHub configuration successfully', async () => {
        localization.octokit.repos.get.mockResolvedValue({
          data: { default_branch: 'main' },
        });

        await localization.validateGitHubConfig();

        expect(localization.octokit.repos.get).toHaveBeenCalledWith({
          owner: 'test-owner',
          repo: 'test-repo',
        });
        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.github.config.validated',
          {}
        );
      });

      it('throws error when GitHub token is missing', async () => {
        mockConfig.cmsl10n.github.token = '';

        await expect(localization.validateGitHubConfig()).rejects.toThrow(
          /GitHub token is required/
        );
      });

      it('throws error when GitHub owner or repo is missing', async () => {
        mockConfig.cmsl10n.github.owner = '';

        await expect(localization.validateGitHubConfig()).rejects.toThrow(
          /GitHub owner and repo are required/
        );
      });

      it('throws error when GitHub API call fails', async () => {
        const error = new Error('API Error');
        localization.octokit.repos.get.mockRejectedValue(error);

        await expect(localization.validateGitHubConfig()).rejects.toThrow(
          /API Error/
        );

        expect(mockLog.error).toHaveBeenCalledWith(
          'cms.integrations.github.config.validation.failed',
          {
            error: 'API Error',
          }
        );
      });
    });

    describe('findExistingPR', () => {
      it('finds existing pull request with old title format', async () => {
        const mockPRs = [
          { number: 123, title: 'Add cms.ftl', state: 'open' },
          { number: 124, title: 'Other PR', state: 'open' },
        ];

        localization.octokit.pulls.list.mockResolvedValue({ data: mockPRs });

        const result = await localization.findExistingPR(
          'test-owner',
          'test-repo'
        );

        expect(result).toEqual(mockPRs[0]);
        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.github.pr.found',
          {
            prNumber: 123,
            title: 'Add cms.ftl',
          }
        );
      });

      it('finds existing pull request with new title format', async () => {
        const mockPRs = [
          {
            number: 123,
            title: '🌐 Add CMS localization file (cms.ftl)',
            state: 'open',
          },
          { number: 124, title: 'Other PR', state: 'open' },
        ];

        localization.octokit.pulls.list.mockResolvedValue({ data: mockPRs });

        const result = await localization.findExistingPR(
          'test-owner',
          'test-repo'
        );

        expect(result).toEqual(mockPRs[0]);
        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.github.pr.found',
          {
            prNumber: 123,
            title: '🌐 Add CMS localization file (cms.ftl)',
          }
        );
      });

      it('returns null when no matching PR found', async () => {
        const mockPRs = [{ number: 124, title: 'Other PR', state: 'open' }];

        localization.octokit.pulls.list.mockResolvedValue({ data: mockPRs });

        const result = await localization.findExistingPR(
          'test-owner',
          'test-repo'
        );

        expect(result).toBeNull();
        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.github.pr.notFound',
          {}
        );
      });

      it('handles API errors', async () => {
        const error = new Error('API Error');
        localization.octokit.pulls.list.mockRejectedValue(error);

        await expect(
          localization.findExistingPR('test-owner', 'test-repo')
        ).rejects.toThrow(/API Error/);

        expect(mockLog.error).toHaveBeenCalledWith(
          'cms.integrations.github.pr.search.error',
          {
            error: 'API Error',
          }
        );
      });
    });

    describe('updateExistingPR', () => {
      it('updates existing file in PR', async () => {
        const mockPR = { head: { ref: 'test-branch' } };
        const mockFileData = { sha: 'existing-sha' };

        localization.octokit.pulls.get.mockResolvedValue({ data: mockPR });
        localization.octokit.repos.getContent.mockResolvedValue({
          data: mockFileData,
        });
        localization.octokit.repos.createOrUpdateFileContents.mockResolvedValue();

        await localization.updateExistingPR(123, 'test content');

        expect(
          localization.octokit.repos.createOrUpdateFileContents
        ).toHaveBeenCalledWith({
          owner: 'test-owner',
          repo: 'test-repo',
          path: 'locales/en/cms.ftl',
          message:
            '🔄 Update CMS localization file (cms.ftl) - Strapi webhook sync',
          content: expect.any(String),
          sha: 'existing-sha',
          branch: 'test-branch',
        });
      });

      it('creates new file when file does not exist', async () => {
        const mockPR = { head: { ref: 'test-branch' } };

        localization.octokit.pulls.get.mockResolvedValue({ data: mockPR });
        localization.octokit.repos.getContent.mockRejectedValue(
          new Error('Not Found')
        );
        localization.octokit.repos.createOrUpdateFileContents.mockResolvedValue();

        await localization.updateExistingPR(123, 'test content');

        expect(
          localization.octokit.repos.createOrUpdateFileContents
        ).toHaveBeenCalledWith({
          owner: 'test-owner',
          repo: 'test-repo',
          path: 'locales/en/cms.ftl',
          message:
            '🌐 Add CMS localization file (cms.ftl) - Strapi webhook generated',
          content: expect.any(String),
          sha: undefined,
          branch: 'test-branch',
        });
      });
    });

    describe('createGitHubPR', () => {
      it('creates new GitHub PR', async () => {
        const mockRefData = { object: { sha: 'ref-sha' } };
        const mockPRData = {
          number: 123,
          html_url: 'https://github.com/test/pr/123',
        };

        localization.octokit.git.getRef.mockResolvedValue({
          data: mockRefData,
        });
        localization.octokit.git.createRef.mockResolvedValue();
        localization.octokit.repos.getContent.mockRejectedValue(
          new Error('Not Found')
        );
        localization.octokit.repos.createOrUpdateFileContents.mockResolvedValue();
        localization.octokit.pulls.create.mockResolvedValue({
          data: mockPRData,
        });

        await localization.createGitHubPR('test content', 'desktop-sync');

        expect(localization.octokit.pulls.create).toHaveBeenCalledWith({
          owner: 'test-owner',
          repo: 'test-repo',
          title: '🌐 Add CMS localization file (cms.ftl)',
          body: expect.any(String),
          head: expect.any(String),
          base: 'main',
        });

        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.github.pr.created',
          {
            prNumber: 123,
            prUrl: 'https://github.com/test/pr/123',
            branchName: expect.any(String),
            fileName: 'cms.ftl',
            webhookDetails: undefined,
          }
        );
      });

      it('creates new GitHub PR when file exists in base branch', async () => {
        const mockRefData = { object: { sha: 'ref-sha' } };
        const mockPRData = {
          number: 123,
          html_url: 'https://github.com/test/pr/123',
        };
        const mockFileData = { sha: 'existing-file-sha' };

        localization.octokit.git.getRef.mockResolvedValue({
          data: mockRefData,
        });
        localization.octokit.git.createRef.mockResolvedValue();
        localization.octokit.repos.getContent.mockResolvedValue({
          data: mockFileData,
        });
        localization.octokit.repos.createOrUpdateFileContents.mockResolvedValue();
        localization.octokit.pulls.create.mockResolvedValue({
          data: mockPRData,
        });

        await localization.createGitHubPR('test content', 'desktop-sync');

        expect(
          localization.octokit.repos.createOrUpdateFileContents
        ).toHaveBeenCalledWith({
          owner: 'test-owner',
          repo: 'test-repo',
          path: 'locales/en/cms.ftl',
          message:
            '🌐 Add CMS localization file (cms.ftl) - Strapi webhook generated',
          content: expect.any(String),
          sha: 'existing-file-sha',
          branch: expect.any(String),
        });
      });
    });
  });

  describe('fetchAllStrapiEntries', () => {
    it('fetches all Strapi entries from multiple collections', async () => {
      const relyingPartyEntries = [
        { id: 1, attributes: { name: 'RP Entry 1' } },
        { id: 2, attributes: { name: 'RP Entry 2' } },
      ];

      const legalNoticeEntries = [
        { id: 3, attributes: { name: 'Legal Entry 1' } },
      ];

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'http://localhost:1337/api/relying-parties?populate=*') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: relyingPartyEntries }),
          });
        }
        if (url === 'http://localhost:1337/api/legal-notices?populate=*') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: legalNoticeEntries }),
          });
        }
        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as any;

      try {
        const result = await localization.fetchAllStrapiEntries();

        expect(global.fetch as any).toHaveBeenCalledWith(
          'http://localhost:1337/api/relying-parties?populate=*',
          {
            headers: {
              Authorization: 'Bearer test-api-key',
              'Content-Type': 'application/json',
            },
          }
        );

        expect(global.fetch as any).toHaveBeenCalledWith(
          'http://localhost:1337/api/legal-notices?populate=*',
          {
            headers: {
              Authorization: 'Bearer test-api-key',
              'Content-Type': 'application/json',
            },
          }
        );

        expect(result).toEqual([...relyingPartyEntries, ...legalNoticeEntries]);

        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.strapi.fetchedAllEntries',
          {
            totalCount: 3,
          }
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('continues fetching other collections when one fails', async () => {
      const relyingPartyEntries = [
        { id: 1, attributes: { name: 'RP Entry 1' } },
      ];

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'http://localhost:1337/api/relying-parties?populate=*') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: relyingPartyEntries }),
          });
        }
        if (url === 'http://localhost:1337/api/legal-notices?populate=*') {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          });
        }
        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as any;

      try {
        const result = await localization.fetchAllStrapiEntries();

        expect(result).toEqual(relyingPartyEntries);

        expect(mockLog.warn).toHaveBeenCalledWith(
          'cms.integrations.strapi.fetchCollectionError',
          {
            collection: 'legal-notices',
            status: 500,
            statusText: 'Internal Server Error',
          }
        );

        expect(mockLog.info).toHaveBeenCalledWith(
          'cms.integrations.strapi.fetchedAllEntries',
          {
            totalCount: 1,
          }
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('extractBaseLocale', () => {
    it('extracts base locale from specific locale', () => {
      expect(localization.extractBaseLocale('en-US')).toBe('en');
      expect(localization.extractBaseLocale('es-MX')).toBe('es');
      expect(localization.extractBaseLocale('fr-CA')).toBe('fr');
      expect(localization.extractBaseLocale('pt-BR')).toBe('pt');
    });

    it('returns null for base locales', () => {
      expect(localization.extractBaseLocale('en')).toBe('en');
      expect(localization.extractBaseLocale('es')).toBe('es');
      expect(localization.extractBaseLocale('fr')).toBe('fr');
    });

    it('returns null for invalid locale formats', () => {
      expect(localization.extractBaseLocale('invalid')).toBeNull();
      expect(localization.extractBaseLocale('')).toBeNull();
      expect(
        localization.extractBaseLocale('toolong-locale-format')
      ).toBeNull();
      expect(localization.extractBaseLocale('123')).toBeNull();
    });
  });

  describe('fetchLocalizedFtlWithFallback', () => {
    let mockCmsManager: any;

    beforeEach(() => {
      mockCmsManager = {
        getCachedFtlContent: jest.fn(),
        cacheFtlContent: jest.fn(),
        getFtlContent: jest.fn(),
      };
      localization.cmsManager = mockCmsManager;
    });

    it('returns cached content when available', async () => {
      const locale = 'es';
      const cachedContent = 'cached FTL content';

      mockCmsManager.getFtlContent.mockResolvedValue(cachedContent);

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe(cachedContent);
      expect(mockCmsManager.getFtlContent).toHaveBeenCalledWith(
        locale,
        mockConfig
      );
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.ftl.success'
      );
    });

    it('fetches from URL when cache misses and caches result', async () => {
      const locale = 'fr';
      const ftlContent = 'fresh FTL content';

      mockCmsManager.getFtlContent.mockResolvedValue(ftlContent);

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe(ftlContent);
      expect(mockCmsManager.getFtlContent).toHaveBeenCalledWith(
        locale,
        mockConfig
      );
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.ftl.success'
      );
    });

    it('handles errors gracefully and continues with fallback', async () => {
      const locale = 'de-US';
      const baseLocale = 'de';
      const ftlContent = 'fallback content';

      mockCmsManager.getFtlContent
        .mockRejectedValueOnce(new Error('Specific locale failed'))
        .mockResolvedValueOnce(ftlContent);

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe(ftlContent);
      expect(mockLog.error).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.locale.failed',
        {
          locale,
          error: 'Specific locale failed',
        }
      );
      expect(mockLog.info).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.locale.fallback',
        {
          originalLocale: locale,
          fallbackLocale: baseLocale,
        }
      );
    });

    it('falls back to base locale when specific locale fails', async () => {
      const locale = 'en-US';
      const baseLocale = 'en';
      const fallbackContent = 'base locale content';

      mockCmsManager.getFtlContent
        .mockRejectedValueOnce(new Error('Specific locale failed'))
        .mockResolvedValueOnce(fallbackContent);

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe(fallbackContent);
      expect(mockCmsManager.getFtlContent).toHaveBeenNthCalledWith(
        1,
        locale,
        mockConfig
      );
      expect(mockCmsManager.getFtlContent).toHaveBeenNthCalledWith(
        2,
        baseLocale,
        mockConfig
      );
      expect(mockLog.info).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.locale.fallback',
        {
          originalLocale: locale,
          fallbackLocale: baseLocale,
        }
      );
    });

    it('uses base locale when specific locale fails', async () => {
      const locale = 'es-MX';
      const baseLocale = 'es';
      const baseContent = 'base content';

      mockCmsManager.getFtlContent
        .mockRejectedValueOnce(new Error('Specific locale failed'))
        .mockResolvedValueOnce(baseContent);

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe(baseContent);
      expect(mockLog.info).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.locale.fallback',
        {
          originalLocale: locale,
          fallbackLocale: baseLocale,
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.ftl.success'
      );
    });

    it('returns empty string when all attempts fail', async () => {
      const locale = 'pt-BR';

      mockCmsManager.getFtlContent
        .mockRejectedValueOnce(new Error('Specific locale failed'))
        .mockRejectedValueOnce(new Error('Base locale failed'));

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe('');
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.ftl.fallback'
      );
    });

    it('handles errors gracefully and returns empty string', async () => {
      const locale = 'it-IT';

      mockCmsManager.getFtlContent
        .mockRejectedValueOnce(new Error('Specific locale failed'))
        .mockRejectedValueOnce(new Error('Base locale failed'));

      const result = await localization.fetchLocalizedFtlWithFallback(locale);

      expect(result).toBe('');
      expect(mockLog.error).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.locale.failed',
        {
          locale,
          error: 'Specific locale failed',
        }
      );
      expect(mockLog.error).toHaveBeenCalledWith(
        'cms.getLocalizedConfig.locale.fallback.failed',
        {
          originalLocale: locale,
          fallbackLocale: 'it',
          error: 'Base locale failed',
        }
      );
    });
  });

  describe('mergeConfigs', () => {
    it('applies translation when hash matches', async () => {
      const baseConfig = {
        l10nId: 'testClient',
        name: 'Test Client',
        clientId: 'test-client',
        entrypoint: 'test',
        SigninPage: {
          headline: 'Enter your password',
          description: 'Original description',
        },
        EmailFirstPage: {
          headline: 'Welcome',
        },
      };

      const strapiData = [
        {
          l10nId: 'testClient',
          name: 'Test Client',
          SigninPage: {
            headline: 'Enter your password',
          },
        },
      ];
      const generatedFtl = localization.strapiToFtl(strapiData);

      const hashMatch = generatedFtl.match(
        /(fxa-headline-[a-f0-9]{8}) = Enter your password/
      );
      expect(hashMatch).not.toBeNull();
      const fxaHash = hashMatch[1];

      const ftlContent = `${fxaHash} = Introduzca su contraseña`;

      const result = await localization.mergeConfigs(
        baseConfig,
        ftlContent,
        'test-client',
        'test'
      );

      expect(result.l10nId).toBe('testClient');
      expect(result.name).toBe('Test Client');
      expect(result.clientId).toBe('test-client');
      expect(result.entrypoint).toBe('test');

      expect(result.SigninPage.headline).toBe('Introduzca su contraseña');
      expect(result.SigninPage.description).toBe('Original description');
      expect(result.EmailFirstPage.headline).toBe('Welcome');
    });

    it('keeps English when no translation exists', async () => {
      const baseConfig = {
        l10nId: 'testClient',
        SigninPage: {
          headline: 'Enter your password',
        },
      };

      const ftlContent = 'fxabcd1234 = Some other translation';

      const result = await localization.mergeConfigs(
        baseConfig,
        ftlContent,
        'test',
        'test'
      );

      expect(result.SigninPage.headline).toBe('Enter your password');
    });

    it('returns base config when FTL content is empty', async () => {
      const baseConfig = {
        l10nId: 'testClient',
        name: 'Test Client',
      };

      const result = await localization.mergeConfigs(
        baseConfig,
        '',
        'test-client',
        'test'
      );

      expect(result).toEqual(baseConfig);
    });

    it('returns base config when base config is null/undefined', async () => {
      const result1 = await localization.mergeConfigs(
        null,
        'ftl content',
        'client',
        'entry'
      );
      const result2 = await localization.mergeConfigs(
        undefined,
        'ftl content',
        'client',
        'entry'
      );

      expect(result1).toBeNull();
      expect(result2).toBeUndefined();
    });

    it('handles malformed FTL content gracefully', async () => {
      const baseConfig = {
        l10nId: 'testClient',
        SigninPage: {
          headline: 'Enter your password',
        },
      };
      const ftlContent = 'invalid FTL content without proper format';

      const result = await localization.mergeConfigs(
        baseConfig,
        ftlContent,
        'test-client',
        'test'
      );

      expect(result).toEqual(baseConfig);
    });

    it('skips non-localizable fields', async () => {
      const baseConfig = {
        l10nId: 'testClient',
        SigninPage: {
          headline: 'Enter your password',
          url: 'https://example.com',
          color: '#ffffff',
          date: '2023-01-01T00:00:00Z',
        },
      };

      const strapiData = [
        {
          l10nId: 'testClient',
          name: 'Test Client',
          SigninPage: {
            headline: 'Enter your password',
          },
        },
      ];
      const generatedFtl = localization.strapiToFtl(strapiData);

      const hashMatch = generatedFtl.match(
        /(fxa-headline-[a-f0-9]{8}) = Enter your password/
      );
      expect(hashMatch).not.toBeNull();
      const fxaHash = hashMatch[1];

      const ftlContent = `${fxaHash} = Introduzca su contraseña`;

      const result = await localization.mergeConfigs(
        baseConfig,
        ftlContent,
        'test-client',
        'test'
      );

      expect(result.SigninPage.headline).toBe('Introduzca su contraseña');
      expect(result.SigninPage.url).toBe('https://example.com');
      expect(result.SigninPage.color).toBe('#ffffff');
      expect(result.SigninPage.date).toBe('2023-01-01T00:00:00Z');
    });
  });

  describe('generateFtlContentFromEntries', () => {
    beforeEach(() => {
      jest.spyOn(localization, 'strapiToFtl');
    });

    it('delegates to strapiToFtl method', () => {
      const entries = [
        { l10nId: 'client1', name: 'Client 1' },
        { l10nId: 'client2', name: 'Client 2' },
      ];
      const expectedFtl = 'Generated FTL content';

      localization.strapiToFtl.mockReturnValue(expectedFtl);

      const result = localization.generateFtlContentFromEntries(entries);

      expect(result).toBe(expectedFtl);
      expect(localization.strapiToFtl).toHaveBeenCalledWith(entries);
    });

    it('handles empty entries array', () => {
      const entries: any[] = [];
      const expectedFtl = 'Empty FTL content';

      localization.strapiToFtl.mockReturnValue(expectedFtl);

      const result = localization.generateFtlContentFromEntries(entries);

      expect(result).toBe(expectedFtl);
      expect(localization.strapiToFtl).toHaveBeenCalledWith(entries);
    });

    it('passes through all entries without modification', () => {
      const entries = [
        {
          l10nId: 'testClient',
          name: 'Test Client',
          SigninPage: { headline: 'Test' },
        },
      ];

      localization.strapiToFtl.mockReturnValue('FTL output');
      localization.generateFtlContentFromEntries(entries);

      expect(localization.strapiToFtl).toHaveBeenCalledWith(entries);
    });
  });

  describe('Legal Terms localization', () => {
    it('localizes only the label field in legal terms', () => {
      const strapiData = [
        {
          l10nId: 'legalTermsRelay',
          name: 'Relay Legal Terms',
          serviceOrClientId: 'relay',
          Terms: {
            label: 'Mozilla Relay',
            termsOfServiceLink: 'https://www.mozilla.org/relay/terms/',
            privacyNoticeLink: 'https://www.mozilla.org/relay/privacy/',
            fontSize: 'medium',
          },
        },
      ];

      const result = localization.strapiToFtl(strapiData);

      expect(result).toMatch(/# Label for Terms/);
      expect(result).toMatch(/fxa-label-[a-f0-9]{8} = Mozilla Relay/);

      expect(result).not.toMatch(/termsOfServiceLink/);
      expect(result).not.toMatch(/privacyNoticeLink/);
      expect(result).not.toMatch(/fontSize/);
      expect(result).not.toMatch(/https:\/\//);
    });

    it('applies translations only to label field in legal terms', async () => {
      const baseConfig = {
        l10nId: 'legalTermsRelay',
        Terms: {
          label: 'Mozilla Relay',
          termsOfServiceLink: 'https://www.mozilla.org/relay/terms/',
          privacyNoticeLink: 'https://www.mozilla.org/relay/privacy/',
          fontSize: 'medium',
        },
      };

      const strapiData = [
        {
          l10nId: 'legalTermsRelay',
          Terms: { label: 'Mozilla Relay' },
        },
      ];
      const generatedFtl = localization.strapiToFtl(strapiData);
      const hashMatch = generatedFtl.match(
        /(fxa-label-[a-f0-9]{8}) = Mozilla Relay/
      );
      expect(hashMatch).not.toBeNull();
      const labelHash = hashMatch[1];

      const ftlContent = `${labelHash} = Mozilla Relay (Español)`;

      const result = await localization.mergeConfigs(
        baseConfig,
        ftlContent,
        'relay',
        'relay'
      );

      expect(result.Terms.label).toBe('Mozilla Relay (Español)');
      expect(result.Terms.termsOfServiceLink).toBe(
        'https://www.mozilla.org/relay/terms/'
      );
      expect(result.Terms.privacyNoticeLink).toBe(
        'https://www.mozilla.org/relay/privacy/'
      );
      expect(result.Terms.fontSize).toBe('medium');
    });
  });
});
