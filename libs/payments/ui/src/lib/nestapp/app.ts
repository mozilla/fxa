/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'server-only';

import { CartService } from '@fxa/payments/cart';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { LocalizerServer } from '@fxa/shared/l10n/server';
import { singleton } from '../utils/singleton';

class AppSingleton {
  private app!: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  >;

  async initialize() {
    if (!this.app) {
      this.app = await NestFactory.createApplicationContext(AppModule);
    }
  }

  async getLocalizerServer() {
    // Temporary until Next.js canary lands
    await this.initialize();
    return this.app.get(LocalizerServer);
  }

  async getCartService() {
    // Temporary until Next.js canary lands
    await this.initialize();
    return this.app.get(CartService);
  }
}

export const app = singleton('nestApp', new AppSingleton()) as AppSingleton;
