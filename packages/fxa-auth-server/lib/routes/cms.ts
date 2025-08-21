/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import { Container } from 'typedi';
import AppError from '../error';
import isA from 'joi';
import validators from './validators';
import { StatsD } from 'hot-shots';
import { RelyingPartyConfigurationManager } from '@fxa/shared/cms';
import { CMSLocalization, StrapiWebhookPayload } from './utils/cms';

export class CMSHandler {
  private readonly cmsManager: RelyingPartyConfigurationManager | null;
  private config: ConfigType;
  private statsd: StatsD;
  private localization: CMSLocalization;

  constructor(
    private log: AuthLogger,
    config: ConfigType,
    statsD: StatsD
  ) {
    this.cmsManager = Container.has(RelyingPartyConfigurationManager)
      ? Container.get(RelyingPartyConfigurationManager)
      : null;
    this.config = config;
    this.statsd = statsD;
    this.log = log;
    this.localization = new CMSLocalization(log, config);
  }

  ensureCmsManager() {
    if (!this.cmsManager) {
      throw AppError.featureNotEnabled();
    }
  }

  async getConfig(request: AuthRequest) {
    this.log.begin('cms.getConfig', request);

    const clientId = request.query.clientId;
    const entrypoint = request.query.entrypoint;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await this.cmsManager!.fetchCMSData(clientId, entrypoint);

      const { relyingParties } = result;
      if (!relyingParties || relyingParties.length === 0) {
        this.statsd.increment('cms.getConfig.empty');
        this.log.info('cms.getConfig: No relying parties found', {
          clientId,
          entrypoint,
        });
        return {};
      }

      if (relyingParties.length > 1) {
        this.statsd.increment('cms.getConfig.multiple');
        this.log.info('cms.getConfig: Multiple relying parties found', {
          clientId,
          entrypoint,
        });
      }

      return relyingParties[0];
    } catch (error) {
      // We don't want failures to fetch a config to bubble up to the user.
      this.statsd.increment('cms.getConfig.error');
      this.log.error('cms.getConfig: Error getting relying party', {
        clientId,
        entrypoint,
        error,
      });
      return {};
    }
  }

  async handleStrapiWebhook(
    request: AuthRequest
  ): Promise<{ success: boolean }> {
    this.log.begin('cms.strapiWebhook.handle', request);

    if (!this.config.cmsl10n.strapiWebhook.enabled) {
      this.log.warn('cms.strapiWebhook.disabled', {});
      return {
        success: true,
      };
    }

    // Validate webhook authorization
    const authorization = request.headers.authorization as string;
    if (!authorization) {
      this.log.warn('cms.strapiWebhook.missingAuthorization', {});
      throw new Error('Missing authorization header');
    }

    if (
      authorization !== `Bearer ${this.config.cmsl10n.strapiWebhook.secret}`
    ) {
      this.log.warn('cms.strapiWebhook.invalidAuthorization', {});
      throw new Error('Invalid authorization header');
    }

    try {
      // Parse webhook payload to get event type
      const webhookPayload = request.payload as StrapiWebhookPayload;
      const eventType = webhookPayload?.event;

      this.log.info('cms.strapiWebhook.received', {
        eventType,
        model: webhookPayload?.model,
        entryId: webhookPayload?.entry?.id,
      });

      // Only process specific events to avoid duplicate PRs
      // Strapi sends multiple events on publish: entry.publish, entry.update, etc.
      // Only create PRs when entries are actually published
      const allowedEvents = ['entry.publish'];

      if (!eventType || !allowedEvents.includes(eventType)) {
        this.log.info('cms.strapiWebhook.skipped', {
          eventType,
          reason: 'Event not in allowed list',
        });
        return { success: true };
      }

      // Create a unique identifier for this webhook
      const webhookId = `${eventType}-${webhookPayload?.entry?.id}-${webhookPayload?.entry?.updatedAt}`;

      this.log.info('cms.strapiWebhook.processing', {
        webhookId,
        eventType,
      });

      // Query Strapi for all relying party entries
      const allEntries = await this.localization.fetchAllStrapiEntries();

      if (allEntries.length === 0) {
        this.log.warn('cms.strapiWebhook.noEntries', {});
        return { success: true };
      }

      // Validate GitHub configuration before processing
      await this.localization.validateGitHubConfig();

      // Generate FTL content for all entries
      const ftlContent = this.generateFtlContentFromEntries(allEntries);

      // Check for existing PR
      const existingPr = await this.localization.findExistingPR(
        this.config.cmsl10n.github.owner,
        this.config.cmsl10n.github.repo
      );

      if (existingPr) {
        await this.localization.updateExistingPR(
          existingPr.number,
          ftlContent,
          {
            eventType,
            entryId: webhookPayload?.entry?.id,
            model: webhookPayload?.model,
            entriesCount: allEntries.length,
          }
        );
      } else {
        await this.localization.createGitHubPR(ftlContent, 'all-entries', {
          eventType,
          entryId: webhookPayload?.entry?.id,
          model: webhookPayload?.model,
          entriesCount: allEntries.length,
        });
      }

      this.log.info('cms.strapiWebhook.success', {
        webhookId,
        eventType,
        entriesCount: allEntries.length,
        ftlContentLength: ftlContent.length,
      });

      this.statsd.increment('cms.strapiWebhook.processed');
      return { success: true };
    } catch (error) {
      this.log.error('cms.strapiWebhook.error', {
        error: error.message,
      });
      this.statsd.increment('cms.strapiWebhook.error');
      throw error;
    }
  }

  private generateFtlContentFromEntries(entries: any[]): string {
    this.log.info('cms.strapiWebhook.generateFtlContent.start', {
      totalEntries: entries.length,
    });

    try {
      // Use the localization utility to convert Strapi entries to FTL format
      const ftlContent = this.localization.strapiToFtl(entries);

      this.log.info('cms.strapiWebhook.generateFtlContent.success', {
        totalEntries: entries.length,
        ftlContentLength: ftlContent.length,
      });

      return ftlContent;
    } catch (error) {
      this.log.error('cms.strapiWebhook.generateFtlContent.error', {
        error: error.message,
        totalEntries: entries.length,
      });
      throw error;
    }
  }

  async handleCacheInvalidationWebhook(
    request: AuthRequest
  ): Promise<{ success: boolean }> {
    if (
      !this.config.cms.enabled ||
      !this.config.cms.webhookCacheInvalidation.enabled
    ) {
      throw AppError.featureNotEnabled();
    }

    this.log.begin('cms.cacheReset.handle', request);
    const webhookPayload = request.payload as StrapiWebhookPayload;

    if (
      !request.headers[this.config.cms.webhookCacheInvalidation.headerKey] ||
      !crypto.timingSafeEqual(
        Buffer.from(
          request.headers[this.config.cms.webhookCacheInvalidation.headerKey]
        ),
        Buffer.from(this.config.cms.webhookCacheInvalidation.headerVal)
      )
    ) {
      this.log.error(
        'cms.cacheReset.error.auth',
        Object.fromEntries(
          Object.entries(webhookPayload.entry).filter(([k, _]) =>
            ['clientId', 'documentId', 'entrypoint', 'name'].includes(k)
          )
        )
      );
      this.statsd.increment('cms.cacheReset.error.auth', {
        clientId: webhookPayload.entry.clientId,
        entrypoint: webhookPayload.entry.entrypoint,
      });
      throw new Error('Invalid authorization header');
    }

    if (
      webhookPayload.model === 'relying-party' &&
      ['entry.delete', 'entry.publish', 'entry.unpublish'].includes(
        webhookPayload.event
      )
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await this.cmsManager!.invalidateCache(
          webhookPayload.entry.clientId,
          webhookPayload.entry.entrypoint
        );
        this.log.info('cms.cacheReset.success', {
          clientId: webhookPayload.entry.clientId,
          entrypoint: webhookPayload.entry.entrypoint,
        });
        this.statsd.increment('cms.cacheReset.success', {
          clientId: webhookPayload.entry.clientId,
          entrypoint: webhookPayload.entry.entrypoint,
        });
      } catch (err) {
        this.log.error('cms.cacheReset.error.invalidation', {
          error: err.message,
        });
        this.statsd.increment('cms.cacheReset.error.invalidation', {
          clientId: webhookPayload.entry.clientId,
          entrypoint: webhookPayload.entry.entrypoint,
        });
        throw err;
      }
    }

    return { success: true };
  }
}

export const cmsRoutes = (
  log: AuthLogger,
  config: ConfigType,
  statsd: StatsD
) => {
  const cmsHandler = new CMSHandler(log, config, statsd);
  const featureEnabledCheck = () => {
    cmsHandler.ensureCmsManager();
    return true;
  };
  return [
    {
      method: 'GET',
      path: '/cms/config',
      options: {
        pre: [{ method: featureEnabledCheck }],
        validate: {
          query: isA.object({
            clientId: validators.clientId.required(),
            entrypoint: validators.entrypoint,
          }),
        },
      },
      handler: (request: AuthRequest) => cmsHandler.getConfig(request),
    },
    {
      method: 'POST',
      path: '/cms/webhook/strapi',
      handler: (request: AuthRequest) =>
        cmsHandler.handleStrapiWebhook(request),
    },
    {
      method: 'POST',
      path: '/cms/cache/reset',
      options: {
        pre: [{ method: featureEnabledCheck }],
      },
      handler: async (request: AuthRequest) =>
        cmsHandler.handleCacheInvalidationWebhook(request),
    },
  ];
};

export default cmsRoutes;
