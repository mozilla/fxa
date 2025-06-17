/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Represents common metrics context for auth server glean events. This
 * is context that typically exists in query params on web pages, and
 * drives important metric dashboards
 */
export class MetricsContext {
  /** Returns a partial object with empty fields removed. */
  static prune(context: Partial<MetricsContext>): Partial<MetricsContext> {
    const pruned: any = Object.assign({}, context);
    Object.keys(pruned).forEach((x) => {
      if (pruned[x] === undefined) {
        delete pruned[x];
      }
    });
    return pruned;
  }

  deviceId?: string;
  entrypoint?: string;
  flowId?: string;
  flowBeginTime?: number;
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;

  constructor(queryParams?: Record<string, string | undefined>) {
    queryParams = queryParams || {};
    this.deviceId = queryParams['deviceId'] || queryParams['device_id'];
    this.entrypoint = queryParams['entrypoint'];
    this.flowId = queryParams['flowId'] || queryParams['flow_id'];
    this.flowBeginTime =
      queryParams['flowBeginTime'] || queryParams['flow_begin_time']
        ? Number(queryParams['flowBeginTime'] || queryParams['flow_begin_time'])
        : undefined;
    this.utmCampaign =
      queryParams['utmCampaign'] || queryParams['utm_campaign'];
    this.utmContent = queryParams['utmContent'] || queryParams['utm_content'];
    this.utmMedium = queryParams['utmMedium'] || queryParams['utm_medium'];
    this.utmSource = queryParams['utmSource'] || queryParams['utm_source'];
    this.utmTerm = queryParams['utmTerm'] || queryParams['utm_term'];
  }
}
