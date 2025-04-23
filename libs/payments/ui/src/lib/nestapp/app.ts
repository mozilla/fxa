/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'server-only';

import { NestFactory } from '@nestjs/core';

import { logger } from '@fxa/shared/log';
import { AppModule } from './app.module';
import { LocalizerRscFactory } from '@fxa/shared/l10n/server';
import { singleton } from '../utils/singleton';
import { NextJSActionsService } from './nextjs-actions.service';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { StripeWebhookService } from '@fxa/payments/webhooks';

class AppSingleton {
  private app!: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  >;

  async initialize() {
    if (!this.app) {
      this.app = await NestFactory.createApplicationContext(AppModule, {
        logger,
      });
    }
  }

  getL10n(acceptLanguage?: string | null, selectedLocale?: string) {
    const localizerRscFactory = this.app.get(LocalizerRscFactory);
    return localizerRscFactory.createLocalizerRsc(
      acceptLanguage,
      selectedLocale
    );
  }

  getFetchedMessages(acceptLanguage?: string | null, selectedLocale?: string) {
    const localizerRscFactory = this.app.get(LocalizerRscFactory);
    return localizerRscFactory.getFetchedMessages(
      acceptLanguage,
      selectedLocale
    );
  }

  /**
   * This method should be used in any server action wishing to call a server-side module.
   * Do not add individual services/managers/clients to this singleton, rather to NextJSActionsService.
   */
  getActionsService() {
    return this.app.get(NextJSActionsService);
  }

  getEmitterService() {
    return this.app.get(PaymentsEmitterService).getEmitter();
  }

  getStripeWebhookService() {
    return this.app.get(StripeWebhookService);
  }
}

export async function reinitializeNestApp() {
  return (
    singleton('nestApp', new AppSingleton(), true) as AppSingleton
  ).initialize();
}

/**
 * Returns an instance of AppSingleton.
 *
 * Note, exporting a function instead of a constant value, ensures that
 * Next.js pages always fetch the latest AppSingleton
 */
export const getApp = () =>
  singleton('nestApp', new AppSingleton()) as AppSingleton;
