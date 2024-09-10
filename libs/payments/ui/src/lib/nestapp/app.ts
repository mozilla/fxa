/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'server-only';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { LocalizerRscFactory } from '@fxa/shared/l10n/server';
import { singleton } from '../utils/singleton';
import { NextJSActionsService } from './nextjs-actions.service';
import { PaymentsGleanService } from '@fxa/payments/metrics';

class AppSingleton {
  private app!: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  >;

  async initialize() {
    if (!this.app) {
      this.app = await NestFactory.createApplicationContext(AppModule);
    }
  }

  getL10n(acceptLanguage: string) {
    const localizerRscFactory = this.app.get(LocalizerRscFactory);
    return localizerRscFactory.createLocalizerRsc(acceptLanguage);
  }

  getFetchedMessages(acceptLanguage: string) {
    const localizerRscFactory = this.app.get(LocalizerRscFactory);
    return localizerRscFactory.getFetchedMessages(acceptLanguage);
  }

  /**
   * This method should be used in any server action wishing to call a server-side module.
   * Do not add individual services/managers/clients to this singleton, rather to NextJSActionsService.
   */
  getActionsService() {
    return this.app.get(NextJSActionsService);
  }

  getGleanEmitter() {
    return this.app.get(PaymentsGleanService).getEmitter();
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
