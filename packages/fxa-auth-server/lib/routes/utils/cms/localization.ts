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
   * Convert Strapi JSON to FTL format
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
        const ftlId = this.generateFtlIdWithL10nId(l10nId, fieldPath, sanitizedValue);

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

    return ftlLines.join('\n');
  }

  /**
   * Sanitize content for FTL format
   */
  private sanitizeContent(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    return content
      // Normalize Unicode characters and remove problematic ones
      .normalize('NFD') // Decompose Unicode characters
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters (preserve tab, newline, carriage return)
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and BOM
      .trim(); // Remove leading/trailing whitespace
  }

  /**
   * Generate FTL ID with l10nId prefix, component name, field name, and hash
   */
  private generateFtlIdWithL10nId(l10nId: string, fieldPath: string, value: string): string {
    // Create a hash of the value for versioning
    const hash = crypto.createHash('md5').update(value).digest('hex').substring(0, 8);
    // Replace dots with dashes in the field path to create proper FTL ID format
    const fieldPathWithDashes = fieldPath.replace(/\./g, '-');
    return `${l10nId}-${fieldPathWithDashes}-${hash}`;
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
   * Parse FTL ID back to field path
   */
  parseFtlIdToFieldPath(ftlId: string): string | null {
    // Handle format: l10nId-componentName-fieldName-hash
    const parts = ftlId.split('-');

    if (parts.length >= 4) {
      // Remove the l10nId (first part) and hash (last part)
      const fieldParts = parts.slice(1, -1);
      return fieldParts.join('.');
    }

    return null;
  }

  /**
   * Convert FTL content to Strapi format
   */
  convertFtlToStrapiFormat(
    l10nId: string,
    ftlContent: string,
    baseData: any
  ): any {
    const strapiFormat: any = {
      clientId: baseData.clientId,
      entrypoint: baseData.entrypoint,
      name: baseData.name,
      l10nId: baseData.l10nId,
    };

    const lines = ftlContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const match = trimmedLine.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.*)$/);
      if (match) {
        const [, ftlId, value] = match;

        // Extract l10nId from the FTL ID (format: l10nId-componentName-fieldName-hash)
        const ftlIdParts = ftlId.split('-');
        if (ftlIdParts.length >= 3) {
          const ftlL10nId = ftlIdParts[0];
          if (ftlL10nId === l10nId) {
            const fieldPath = this.parseFtlIdToFieldPath(ftlId);

            if (fieldPath) {
              const parts = fieldPath.split('.');
              if (parts.length >= 2) {
                const componentName = parts[0];
                const fieldName = parts[1];

                // Initialize component if it doesn't exist
                if (!strapiFormat[componentName]) {
                  strapiFormat[componentName] = {};
                }

                // Set the localized value (unescape quotes and newlines)
                const unescapedValue = value
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, '\n')
                  .replace(/\\r/g, '\r');

                strapiFormat[componentName][fieldName] = unescapedValue;

                this.log.debug('cms.localization.convert.ftlToStrapi', {
                  ftlId,
                  ftlL10nId,
                  targetL10nId: l10nId,
                  fieldPath,
                  componentName,
                  fieldName,
                  value: unescapedValue,
                });
              }
            }
          } else {
            this.log.debug('cms.localization.convert.ftlToStrapi.skipped', {
              ftlId,
              ftlL10nId,
              targetL10nId: l10nId,
            });
          }
        }
      }
    }

    this.log.info('cms.localization.convert.ftlToStrapi.complete', {
      l10nId,
      totalLines: lines.length,
      processedComponents: Object.keys(strapiFormat).filter(key => key !== 'clientId' && key !== 'entrypoint' && key !== 'name' && key !== 'l10nId').length,
    });

    return strapiFormat;
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
   * Merge base config with localized FTL content
   */
  public async mergeConfigs(baseConfig: Record<string, unknown>, ftlContent: string, clientId: string, entrypoint: string): Promise<Record<string, unknown>> {
    if (!ftlContent || !baseConfig) {
      return baseConfig;
    }

    try {
      // Generate l10nId for this client/entrypoint combination
      const l10nId = baseConfig.l10nId as string;

      // Convert FTL to Strapi format using existing utility
      const localizedData = this.convertFtlToStrapiFormat(
        l10nId,
        ftlContent,
        baseConfig
      );

      // Deep merge with base config (localized data takes precedence)
      return this.deepMerge(baseConfig, localizedData);
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
   * Deep merge utility for combining base and localized configs
   */
  private deepMerge(base: Record<string, unknown>, localized: Record<string, unknown>): Record<string, unknown> {
    const result = { ...base };

    for (const [key, value] of Object.entries(localized)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge((result[key] as Record<string, unknown>) || {}, value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Generate FTL content from Strapi entries
   */
  public generateFtlContentFromEntries(entries: Record<string, unknown>[]): string {
    return this.strapiToFtl(entries);
  }
}
