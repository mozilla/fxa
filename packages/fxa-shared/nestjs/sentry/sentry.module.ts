/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { DynamicModule, Inject, Module, ModuleMetadata } from '@nestjs/common';
import { SentryConfigOpts } from '../../sentry';
import { SENTRY_CONFIG } from './sentry.constants';
import { SentryService } from './sentry.service';
import { ErrorEvent } from '@sentry/types';
import { ExtraErrorData } from '@sentry/integrations';
import { filterSentryEvent } from './reporting';
import { buildSentryConfig, tagCriticalEvent, tagFxaName } from '../../sentry';
import * as Sentry from '@sentry/node';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry.interceptor';
import { init as initTracing } from '../../tracing/node-tracing';
import { ILogger } from '../../log';
import { TracingOpts } from '../../tracing/config';
import { MozLoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

export interface SentryConfigParams {
  config: SentryConfigOpts & { tracing: TracingOpts };
}

export interface SentryModuleAsyncParams
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (
    configService: ConfigService,
    logService: MozLoggerService
  ) => SentryConfigParams | Promise<SentryConfigParams>;
  inject?: any[];
}

@Module({
  providers: [SentryService],
})
export class SentryModule {
  static init(configService: ConfigService, logService: MozLoggerService) {
    // Note these must be initialized once and in the following order!
    logService.info('sentry-module', { msg: '!!! Sentry module factory' });

    const sentryConfig = {
      release: configService.get('release'),
      version: configService.get('version'),
      sentry: configService.get('sentry'),
    };
    if (sentryConfig.sentry) {
      logService.info('sentry-module', {
        msg: '!!! Sentry module factory - init sentry',
      });
      SentryModule.initSentry(sentryConfig, logService);
    }

    const tracingConfig = configService.get('tracing');
    if (tracingConfig) {
      logService.info('sentry-module', {
        msg: '!!! Sentry module factory - init tracing',
      });
      SentryModule.initTracing({ tracing: tracingConfig }, logService);
    }

    return {
      ...sentryConfig,
      ...tracingConfig,
    };
  }

  static initSentry(config: SentryConfigOpts, log: ILogger) {
    log.info('sentry-module', {
      msg: `!!! Sentry Module register for ${config.sentry?.serverName}`,
    });

    // Setup Sentry
    const opts = buildSentryConfig(config, log);
    Sentry.init({
      ...opts,
      instrumenter: 'otel',

      // Defaults
      normalizeDepth: 6,
      integrations: [new ExtraErrorData({ depth: 5 })],

      beforeSend(event: ErrorEvent, hint) {
        event = tagCriticalEvent(event);
        event = tagFxaName(event, config.sentry?.serverName || 'unknown');
        event = filterSentryEvent(event, hint);
        return event;
      },
    });
  }

  static initTracing(config: { tracing: TracingOpts }, log: ILogger) {
    log.info('sentry-module', {
      msg: `!!! Init tracing for ${config.tracing.serviceName}`,
    });
    initTracing(config.tracing, log);
  }

  static forRootAsync(options: SentryModuleAsyncParams): DynamicModule {
    return {
      module: SentryModule,
      imports: options.imports,
      providers: [
        {
          provide: SENTRY_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        SentryService,
        {
          provide: APP_INTERCEPTOR,
          useClass: SentryInterceptor,
        },
      ],
      exports: [SentryService],
    };
  }
}
