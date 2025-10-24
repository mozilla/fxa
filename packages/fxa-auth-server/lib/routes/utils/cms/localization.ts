/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../../../config';
import { AuthLogger } from '../../../types';
import crypto from 'crypto';
import { Octokit } from '@octokit/rest';
import { RelyingPartyConfigurationManager } from '@fxa/shared/cms';
import { StatsD } from 'hot-shots';

export class CMSLocalization {
  private octokit: Octokit;

  constructor(
    private log: AuthLogger,
    private config: ConfigType,
    private cmsManager: RelyingPartyConfigurationManager,
    private statsd: StatsD
  ) {
    // Initialize Octokit client
    const { github } = this.config.cmsl10n;
    this.octokit = new Octokit({
      auth: github.token,
    });
    this.cmsManager = cmsManager;
  }

  /**
   * Helper function to check if a value is a string
   */
  private isStringValue(value: any): boolean {
    return typeof value === 'string' && value.trim() !== '';
  }

  /**
   * Helper function to check if a value is a URL
   */
  private isUrl(value: any): boolean {
    return typeof value === 'string' && (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('//')
    );
  }

  /**
   * Helper function to check if a value is a date
   */
  private isDate(value: any): boolean {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
  }

  /**
   * Helper function to check if a value is a color
   */
  private isColor(value: any): boolean {
    return typeof value === 'string' && (
      value.startsWith('#') ||
      value.startsWith('rgb(') ||
      value.startsWith('rgba(') ||
      value.includes('linear-gradient')
    );
  }

  /**
   * Helper function to determine if a field should be included in localization
   */
  private shouldIncludeField(key: string, value: any): boolean {
    // Skip metadata fields
    if (['id', 'documentId', 'clientId', 'createdAt', 'updatedAt', 'publishedAt', 'entrypoint', 'name', 'l10nId'].includes(key)) {
      return false;
    }

    // Skip non-string values
    if (!this.isStringValue(value)) {
      return false;
    }

    // Skip URLs, dates, and colors
    return !(this.isUrl(value) || this.isDate(value) || this.isColor(value));
  }

  /**
   * Extract string fields from an object recursively
   */
  private extractStringsFromObject(obj: any, prefix = ''): Record<string, string> {
    const strings: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively extract from nested objects
        const nestedStrings = this.extractStringsFromObject(value, prefix ? `${prefix}.${key}` : key);
        Object.assign(strings, nestedStrings);
      } else if (this.shouldIncludeField(key, value)) {
        // Add string field
        const fieldKey = prefix ? `${prefix}.${key}` : key;
        strings[fieldKey] = value as string;
      }
    }

    return strings;
  }

  /**
   * Convert Strapi JSON to FTL format using hash-only IDs
   * Each string field gets a unique hash ID based on its content.
   * Identical English strings will share the same translation across all contexts.
   */
  strapiToFtl(strapiData: any[]): string {
    const ftlLines: string[] = [];

    // Add generation timestamp and description
    const timestamp = new Date().toISOString();
    ftlLines.push(`### Generated on ${timestamp}`);
    ftlLines.push(`### FTL file for CMS localization`);
    ftlLines.push('');

    // Collect all entries with their FTL data
    const allEntries: Array<{
      l10nId: string;
      ftlId: string;
      value: string;
      fieldPath: string;
      entryName?: string;
      entrypoint?: string;
    }> = [];

    for (const entry of strapiData) {
      if (!entry || typeof entry !== 'object') continue;

      const { l10nId, name, entrypoint, ...entryData } = entry;
      if (!l10nId) continue;

      // Extract all string fields from the entry
      const strings = this.extractStringsFromObject(entryData);

      // Convert each string to FTL format
      for (const [fieldPath, value] of Object.entries(strings)) {
        const sanitizedValue = this.sanitizeContent(value);
        const componentName = fieldPath.replace(/\./g, '-');
        const ftlId = this.generateFtlId(sanitizedValue, componentName);

        allEntries.push({
          l10nId,
          ftlId,
          value: sanitizedValue,
          fieldPath,
          entryName: name,
          entrypoint,
        });
      }
    }

    // Sort entries by l10nId, then by fieldPath for consistent ordering
    allEntries.sort((a, b) => {
      if (a.l10nId !== b.l10nId) {
        return a.l10nId.localeCompare(b.l10nId);
      }
      return a.fieldPath.localeCompare(b.fieldPath);
    });

    // Remove duplicates based on FTL ID (keep first occurrence)
    const uniqueEntries: typeof allEntries = [];
    const seenFtlIds = new Set<string>();

    for (const entry of allEntries) {
      if (!seenFtlIds.has(entry.ftlId)) {
        seenFtlIds.add(entry.ftlId);
        uniqueEntries.push(entry);
      }
    }

    // Group entries by l10nId and add section headers
    let currentL10nId = '';
    for (const entry of uniqueEntries) {
      // Add section header when l10nId changes
      if (entry.l10nId !== currentL10nId) {
        if (currentL10nId !== '') {
          ftlLines.push(''); // Add blank line between sections
        }
        currentL10nId = entry.l10nId;
        ftlLines.push(`## ${entry.l10nId} - ${entry.entryName || 'CMS Entry'}`);
      }

      // Add descriptive comment for each entry
      const comment = this.generateFieldComment(entry.fieldPath, entry.value, entry.entryName, entry.entrypoint);
      ftlLines.push(`# ${comment}`);
      ftlLines.push(`${entry.ftlId} = ${entry.value}`);
    }

    const ftlContent = ftlLines.join('\n');
    return this.sanitizeFtlContent(ftlContent);
  }

  /**
   * Sanitize FTL content
   */
  private sanitizeFtlContent(ftlContent: string): string {
    return this.sanitizeContent(ftlContent, {
      normalizeUnicode: false,
      removeControlChars: false,
      trimWhitespace: false,
      normalizeLineEndings: true,
      ensureFileTermination: true
    });
  }

  /**
   * Sanitize content for FTL format
   * @param content - The content to sanitize
   * @param options - Sanitization options
   */
  private sanitizeContent(content: string, options: {
    normalizeUnicode?: boolean;
    removeControlChars?: boolean;
    trimWhitespace?: boolean;
    normalizeLineEndings?: boolean;
    ensureFileTermination?: boolean;
  } = {}): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    const {
      normalizeUnicode = true,
      removeControlChars = true,
      trimWhitespace = true,
      normalizeLineEndings = false,
      ensureFileTermination = false
    } = options;

    let sanitized = content
      .replace(/^\uFEFF/, '')
      .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2028\u2029]/g, normalizeLineEndings ? '\n' : '')
      .replace(/[\u2060]/g, '');

    // Apply optional sanitizations
    if (normalizeUnicode) {
      sanitized = sanitized.normalize('NFC');
    }

    if (removeControlChars) {
      // eslint-disable-next-line no-control-regex
      sanitized = sanitized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
    }

    if (normalizeLineEndings) {
      sanitized = sanitized
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
    }

    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    if (ensureFileTermination) {
      sanitized = sanitized.replace(/\n*$/, '\n');
    }

    return sanitized;
  }

  /**
   * Generate FTL ID using only the hash of the string content
   * Identical English strings will share the same translation for a given component
   *
   * Note: Uses 8-character MD5 substring. Hash collisions are extremely unlikely
   * but if they become an issue, the hash length can be increased.
   */
  private generateFtlId(value: string, componentName: string): string {
    // Create a hash of the value and prefix with "fxa-<component>-"
    const hash = crypto.createHash('md5').update(value).digest('hex').substring(0, 8);
    return `fxa-${componentName}-${hash}`;
  }

  /**
   * Generate descriptive comment for a field
   */
  private generateFieldComment(fieldPath: string, value: string, entryName?: string, entrypoint?: string): string {
    const parts = fieldPath.split('.');
    const componentName = parts[0] || 'Unknown';
    const fieldName = parts[1] || 'Unknown';

    // Convert camelCase to readable format
    const readableComponentName = componentName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    const readableFieldName = fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    // Create simple comment format: "Headline for Signin Page"
    return `${readableFieldName} for ${readableComponentName}`;
  }


  /**
   * Validate GitHub configuration
   */
  async validateGitHubConfig(): Promise<void> {
    const { github } = this.config.cmsl10n;

    if (!github.token) {
      throw new Error('GitHub token is required for Strapi webhook');
    }

    if (!github.owner || !github.repo) {
      throw new Error('GitHub owner and repo are required for Strapi webhook');
    }

    try {
      // Test GitHub API access
      await this.octokit.repos.get({
        owner: github.owner,
        repo: github.repo,
      });

      this.log.info('cms.integrations.github.config.validated', {});
    } catch (error) {
      this.log.error('cms.integrations.github.config.validation.failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find existing pull request for the localization
   */
  async findExistingPR(
    owner: string,
    repo: string
  ): Promise<any | null> {
    try {
      // List open pull requests and filter locally instead of using deprecated search API
      const { data: pullRequests } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 100, // Get up to 100 PRs to search through
      });

      const existingPR = pullRequests.find((pr: any) => {
        return (pr.title.includes('cms.ftl') || pr.title.includes('CMS localization')) && pr.state === 'open';
      });

      if (existingPR) {
        this.log.info('cms.integrations.github.pr.found', {
          prNumber: existingPR.number,
          title: existingPR.title,
        });
        return existingPR;
      }

      this.log.info('cms.integrations.github.pr.notFound', {});
      return null;
    } catch (error) {
      this.log.error('cms.integrations.github.pr.search.error', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update existing pull request with new content
   */
  async updateExistingPR(
    prNumber: number,
    ftlContent: string,
    webhookDetails?: {
      eventType?: string;
      entryId?: number;
      model?: string;
      entriesCount?: number;
    }
  ): Promise<void> {
    try {
      const { github } = this.config.cmsl10n;
      const fileName = 'cms.ftl';
      const filePath = `locales/en/${fileName}`;

      // Get the PR to find the branch
      const { data: pr } = await this.octokit.pulls.get({
        owner: github.owner,
        repo: github.repo,
        pull_number: prNumber,
      });

      // Try to get the current file content to get the SHA
      let fileSha: string | undefined;
      try {
        const { data: fileData } = await this.octokit.repos.getContent({
          owner: github.owner,
          repo: github.repo,
          path: filePath,
          ref: pr.head.ref,
        });

        // If file exists, get its SHA
        if (fileData && !Array.isArray(fileData)) {
          fileSha = (fileData as any).sha;
        }
      } catch (fileError) {
        // File doesn't exist, that's okay - we'll create it
        this.log.info('cms.integrations.github.pr.fileNotFound', {
          path: filePath,
          branch: pr.head.ref,
        });
      }

      // Create or update the file
      const commitMessage = fileSha
        ? `🔄 Update CMS localization file (cms.ftl) - Strapi webhook sync`
        : `🌐 Add CMS localization file (cms.ftl) - Strapi webhook generated`;

      await this.octokit.repos.createOrUpdateFileContents({
        owner: github.owner,
        repo: github.repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(ftlContent).toString('base64'),
        sha: fileSha, // Will be undefined if file doesn't exist, which is fine for creation
        branch: pr.head.ref,
      });

      this.log.info('cms.integrations.github.pr.updated', {
        prNumber,
        fileName,
        fileSha: !!fileSha,
        webhookDetails: webhookDetails ? {
          eventType: webhookDetails.eventType,
          entryId: webhookDetails.entryId,
          model: webhookDetails.model,
          entriesCount: webhookDetails.entriesCount
        } : undefined,
      });
    } catch (error) {
      this.log.error('cms.integrations.github.pr.update.error', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a new GitHub pull request with FTL content
   */
  async createGitHubPR(
    ftlContent: string,
    entrypoint: string,
    webhookDetails?: {
      eventType?: string;
      entryId?: number;
      model?: string;
      entriesCount?: number;
    }
  ): Promise<void> {
    try {
      const { github } = this.config.cmsl10n;
      const fileName = 'cms.ftl';

      // Create new branch
      const branchName = `cms-localization-${Date.now()}`;

      // Get the latest commit SHA
      const { data: refData } = await this.octokit.git.getRef({
        owner: github.owner,
        repo: github.repo,
        ref: `heads/${github.branch}`,
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner: github.owner,
        repo: github.repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });

      // Check if file exists in the base branch to get its SHA
      let fileSha: string | undefined;
      try {
        const { data: fileData } = await this.octokit.repos.getContent({
          owner: github.owner,
          repo: github.repo,
          path: `locales/en/${fileName}`,
          ref: github.branch,
        });

        // If file exists, get its SHA
        if (fileData && !Array.isArray(fileData)) {
          fileSha = (fileData as any).sha;
        }
      } catch (fileError) {
        // File doesn't exist in base branch, that's okay - we'll create it
        this.log.info('cms.integrations.github.pr.fileNotFoundInBase', {
          path: `locales/en/${fileName}`,
          branch: github.branch,
        });
      }

      // Create the file in the new branch
      await this.octokit.repos.createOrUpdateFileContents({
        owner: github.owner,
        repo: github.repo,
        path: `locales/en/${fileName}`,
        message: `🌐 Add CMS localization file (cms.ftl) - Strapi webhook generated`,
        content: Buffer.from(ftlContent).toString('base64'),
        sha: fileSha, // Will be undefined if file doesn't exist, which is fine for creation
        branch: branchName,
      });

      // Create pull request
      const { data: prData } = await this.octokit.pulls.create({
        owner: github.owner,
        repo: github.repo,
        title: `🌐 Add CMS localization file (cms.ftl)`,
        body: `This pull request was automatically generated from a Strapi CMS webhook event.

### 📋 Details
- **Entrypoint**: \`${entrypoint}\`
- **File**: \`locales/en/${fileName}\`
- **Format**: FTL (Fluent Translation List)
- **Generated**: ${new Date().toISOString()}
- **Source**: Strapi CMS webhook${webhookDetails ? `

### 🔗 Webhook Details
- **Event Type**: \`${webhookDetails.eventType || 'unknown'}\`
- **Model**: \`${webhookDetails.model || 'unknown'}\`
- **Entry ID**: \`${webhookDetails.entryId || 'N/A'}\`
- **Total Entries Processed**: \`${webhookDetails.entriesCount || 'unknown'}\`` : ''}`,
        head: branchName,
        base: github.branch,
      });

      this.log.info('cms.integrations.github.pr.created', {
        prNumber: prData.number,
        prUrl: prData.html_url,
        branchName,
        fileName,
        webhookDetails: webhookDetails ? {
          eventType: webhookDetails.eventType,
          entryId: webhookDetails.entryId,
          model: webhookDetails.model,
          entriesCount: webhookDetails.entriesCount
        } : undefined,
      });
    } catch (error) {
      this.log.error('cms.integrations.github.pr.create.error', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Fetch all Strapi entries
   */
  async fetchAllStrapiEntries(): Promise<any[]> {
    // Use the apiKey from strapiClient config for Strapi API calls
    const strapiApiKey = this.config.cms.strapiClient.apiKey;
    const strapiBaseUrl =
      this.config.cmsl10n.strapiWebhook.strapiUrl || 'http://localhost:1337';

    const headers = {
      Authorization: `Bearer ${strapiApiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      this.log.info('cms.integrations.strapi.fetchingEntries', {
        strapiUrl: strapiBaseUrl,
      });

      // Query all relying party entries from Strapi
      const response = await fetch(
        `${strapiBaseUrl}/api/relying-parties?populate=*`,
        {
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.log.error('cms.integrations.strapi.fetchError', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch Strapi entries: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      const entries = data.data || [];

      this.log.info('cms.integrations.strapi.fetchedEntries', {
        count: entries.length,
      });

      return entries;
    } catch (error) {
      this.log.error('cms.integrations.strapi.fetchEntriesError', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Fetch localized FTL content with fallback logic
   * Uses the cached getFtlContent method which handles caching automatically
   */
  public async fetchLocalizedFtlWithFallback(locale: string): Promise<string> {
    let hadErrors = false;

    // First try the specific locale (e.g., 'en-US') using the cached getFtlContent method
    try {
      const ftlContent = await this.cmsManager.getFtlContent(locale, this.config);
      // Even if content is empty, this is a successful fetch
      this.statsd.increment('cms.getLocalizedConfig.ftl.success');
      if (ftlContent) {
        return ftlContent;
      }
    } catch (error) {
      hadErrors = true;
      // Log the failure but don't increment metrics yet
      this.log.error('cms.getLocalizedConfig.locale.failed', {
        locale,
        error: error.message
      });
    }

    // If specific locale failed or returned empty content, try base language fallback
    const baseLocale = this.extractBaseLocale(locale);
    if (baseLocale && baseLocale !== locale) {
      try {
        this.log.info('cms.getLocalizedConfig.locale.fallback', {
          originalLocale: locale,
          fallbackLocale: baseLocale
        });

        const fallbackContent = await this.cmsManager.getFtlContent(baseLocale, this.config);
        // Even if content is empty, this is a successful fetch
        this.statsd.increment('cms.getLocalizedConfig.ftl.success');
        if (fallbackContent) {
          return fallbackContent;
        }
      } catch (error) {
        hadErrors = true;
        this.log.error('cms.getLocalizedConfig.locale.fallback.failed', {
          originalLocale: locale,
          fallbackLocale: baseLocale,
          error: error.message
        });
      }
    }

    // Both attempts failed or returned empty content
    // Only increment ftl.fallback if we had actual errors, not just empty content
    if (hadErrors) {
      this.statsd.increment('cms.getLocalizedConfig.ftl.fallback');
    }
    return '';
  }

  /**
   * Extract base locale from a locale string
   * Supports BCP 47 locale format: language[-script][-region][-variant][-extension]
   */
  public extractBaseLocale(locale: string): string | null {
    // Extract base language from locale (e.g., 'en-US' -> 'en', 'es-MX' -> 'es', 'zh-Hans-CN' -> 'zh')
    // BCP 47 allows language subtags of 2-3 characters, so we use {2,3} instead of {2}
    const match = locale.match(/^([a-z]{2,3})(?:-[A-Za-z0-9]+)*$/);
    return match ? match[1] : null;
  }

  /**
   * Build a translation map from FTL content
   * Parses FTL content and creates a hash -> translation mapping
   */
  private buildTranslationMap(ftlContent: string): Record<string, string> {
    const translationMap: Record<string, string> = {};
    const lines = ftlContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Match FTL format: hash = translation (including hyphens and dots in hash)
      const match = trimmedLine.match(/^([a-zA-Z0-9.-]+)\s*=\s*(.*)$/);
      if (match) {
        const [, hash, translation] = match;

        // Unescape quotes and newlines in the translation
        const unescapedTranslation = translation
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r');

        translationMap[hash] = unescapedTranslation;
      }
    }

    this.log.debug('cms.localization.buildTranslationMap', {
      totalTranslations: Object.keys(translationMap).length,
      hashes: Object.keys(translationMap)
    });

    return translationMap;
  }

  /**
   * Apply translations to a config object recursively
   * Walks through the config and replaces English strings with translations where available
   */
  private applyTranslations(config: Record<string, unknown>, translationMap: Record<string, string>, fieldPath = ''): void {
    for (const [key, value] of Object.entries(config)) {
      if (value === null || value === undefined) {
        continue;
      }

      const currentFieldPath = fieldPath ? `${fieldPath}.${key}` : key;

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively apply translations to nested objects
        this.applyTranslations(value as Record<string, unknown>, translationMap, currentFieldPath);
      } else if (this.shouldIncludeField(key, value)) {
        // This is a localizable string field
        const englishValue = value as string;
        const componentName = currentFieldPath.replace(/\./g, '-');
        const hash = this.generateFtlId(englishValue, componentName);


        if (translationMap[hash]) {
          // Replace with translation if available
          config[key] = translationMap[hash];

          this.log.debug('cms.localization.applyTranslations.replaced', {
            key,
            fieldPath: currentFieldPath,
            hash,
            englishValue,
            translatedValue: translationMap[hash]
          });
        } else {
          // Keep English value if no translation exists
          this.log.debug('cms.localization.applyTranslations.keptEnglish', {
            key,
            fieldPath: currentFieldPath,
            hash,
            englishValue
          });
        }
      }
    }
  }

  /**
   * Merge base config with localized FTL content using translation lookup
   *
   * This method implements a new hash-based translation system:
   * 1. Parses FTL content to build a hash -> translation mapping
   * 2. Walks through the base config recursively
   * 3. For each localizable string field, computes its content hash
   * 4. If a translation exists for that hash, replaces the English text
   * 5. Otherwise, keeps the original English text as fallback
   *
   */
  public async mergeConfigs(baseConfig: Record<string, unknown>, ftlContent: string, clientId: string, entrypoint: string): Promise<Record<string, unknown>> {
    if (!ftlContent || !baseConfig) {
      return baseConfig;
    }

    try {
      // 1. Parse FTL content into hash -> translation map
      const translationMap = this.buildTranslationMap(ftlContent);

      // 2. Clone base config to avoid mutations
      const result = JSON.parse(JSON.stringify(baseConfig));

      // 3. Walk config and apply translations where they exist
      this.applyTranslations(result, translationMap);

      this.log.info('cms.getLocalizedConfig.merge.success', {
        clientId,
        entrypoint,
        totalTranslations: Object.keys(translationMap).length,
        appliedTranslations: Object.keys(translationMap).filter(hash =>
          JSON.stringify(result).includes(translationMap[hash])
        ).length
      });

      return result;
    } catch (error) {
      this.log.error('cms.getLocalizedConfig.merge.error', {
        error: error.message,
        clientId,
        entrypoint
      });
      // Return base config if merge fails
      return baseConfig;
    }
  }


  /**
   * Generate FTL content from Strapi entries
   */
  public generateFtlContentFromEntries(entries: Record<string, unknown>[]): string {
    return this.strapiToFtl(entries);
  }
}
