/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    const { getApp } = await import('@fxa/payments/ui/server');
    const { initTracing } = await import('@fxa/shared/otel');
    const { monkeyPatchServerLogging } = await import('@fxa/shared/log');

    const app = getApp();
    await app.initialize();

    const otelConfig = app.getOtelConfig();
    const logger = app.getLogger();
    initTracing({
      ...otelConfig,
      batchProcessor: otelConfig.batchProcessor ?? true,
      clientName: otelConfig.clientName ?? "",
      corsUrls: otelConfig.corsUrls ?? "http://localhost:\\d*/",
      filterPii: otelConfig.filterPii ?? true,
      sampleRate: otelConfig.sampleRate ?? 0,
      serviceName: otelConfig.serviceName ?? "",
    }, logger);

    monkeyPatchServerLogging();
  }
}
