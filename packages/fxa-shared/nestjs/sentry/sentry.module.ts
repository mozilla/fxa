/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { SentryConfigOpts } from '../../sentry';
import { SENTRY_CONFIG } from './sentry.constants';
import { SentryService } from './sentry.service';

export interface SentryConfigParams {
  sentryConfig: SentryConfigOpts;
}

export interface SentryModuleAsyncParams
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (
    ...args: any[]
  ) => SentryConfigParams | Promise<SentryConfigParams>;
  inject?: any[];
}

@Module({})
export class SentryModule {
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
      ],
    };
  }
}
