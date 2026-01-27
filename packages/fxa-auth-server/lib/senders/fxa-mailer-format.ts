/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { formatUserAgentInfo } from 'fxa-shared/lib/user-agent';
import { constructLocalTimeAndDateStrings } from '@fxa/accounts/email-renderer';

export const FxaMailerFormat = {
  async metricsContext(request: {
    app: {
      metricsContext: Promise<{
        deviceId?: string;
        entrypoint?: string;
        flowId: string;
        flowBeginTime: number;
      }>;
    };
  }) {
    let metricsContext = await request.app.metricsContext;

    return {
      deviceId: metricsContext.deviceId,
      flowId: metricsContext.flowId,
      flowBeginTime: metricsContext.flowBeginTime,
      entrypoint: metricsContext.entrypoint,
    };
  },
  account(account: {
    uid: string;
    email: string;
    emails?: Array<{ isPrimary: boolean; isVerified: boolean; email: string }>;
    metricsOptOutAt: number | undefined | null;
  }) {
    return {
      to:
        account.emails?.find((e) => e.isPrimary && e.isVerified)?.email ||
        account.email,
      cc: account.emails
        ?.filter((e) => !e.isPrimary && e.isVerified)
        .map((e) => e.email),
      metricsEnabled: !account.metricsOptOutAt,
      uid: account.uid,
    };
  },
  device(request: {
    app: { ua: { browser?: string; os?: string; osVersion?: string } };
  }) {
    return {
      device: formatUserAgentInfo(request.app.ua),
    };
  },
  localTime(request: {
    app: { geo: { timeZone: string }; acceptLanguage: string };
  }) {
    return constructLocalTimeAndDateStrings(
      request.app.geo.timeZone,
      request.app.acceptLanguage
    );
  },
  location(request: {
    app: {
      geo: {
        location?: {
          city: string;
          state: string;
          stateCode: string;
          country: string;
          countryCode: string;
          postalCode?: string;
        };
      };
    };
  }): {
    location: {
      stateCode: string;
      country: string;
      city: string;
    };
  } {
    return {
      location: {
        stateCode: request.app.geo.location?.stateCode || '',
        country: request.app.geo.location?.country || '',
        city: request.app.geo.location?.city || '',
      },
    };
  },
  sync(service: string | false) {
    return {
      sync: service === 'sync',
    };
  },
  cmsLogo(opts?: {
    emailLogoAltText: string | null;
    emailLogoUrl: string | null;
    emailLogoWidth: string | null;
  }) {
    return {
      logoAltText: opts?.emailLogoAltText || undefined,
      logoUrl: opts?.emailLogoUrl || undefined,
      logoWidth: opts?.emailLogoWidth || undefined,
    };
  },
  cmsRpInfo(opts?: {
    clientId: string | null;
    shared?: { emailFromName: string | null };
  }) {
    return {
      cmsRpClientId: opts?.clientId || undefined,
      cmsRpFromName: opts?.shared?.emailFromName || undefined,
    };
  },
  cmsEmailSubject(opts?: {
    description: string | null;
    headline: string | null;
    subject: string | null;
  }) {
    return {
      description: opts?.description || undefined,
      headline: opts?.headline || undefined,
      subject: opts?.subject || undefined,
    };
  },
};
