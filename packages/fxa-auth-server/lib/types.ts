/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Request, RequestApplicationState } from '@hapi/hapi';
import { Token } from 'typedi';
import { Logger } from 'mozlog';
import { Firestore } from '@google-cloud/firestore';
import { ConfigType } from '../config';

/**
 * Auth-Server specific interfaces to use objects.
 *
 * These objects define valid interfaces for dynamically assembled objects
 * used frequently in the fxa-auth-server.
 *
 */

export interface AuthApp extends RequestApplicationState {
  devices: Promise<any>;
  locale: string;
  acceptLanguage: string;
  clientAddress: string;
  metricsContext: any;
  metricsEventUid?: string;
  accountRecreated: boolean;
  ua: {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: string;
    formFactor: string;
  };
  isSuspiciousRequest: boolean;
  isMetricsEnabled: Promise<boolean>;
  geo: {
    location?: {
      city: string;
      state: string;
      country: string;
      countryCode: string;
      postalCode?: string;
    };
    [key: string]: any;
  };
}

export interface AuthRequest extends Request {
  auth: Request['auth'] & {
    // AuthRequest will always have scopes present provided by
    // the auth-oauth scheme
    credentials: Request['auth']['credentials'] & { scope: string[] };
  };
  // eslint-disable-next-line no-use-before-define
  log: AuthLogger;
  app: AuthApp;
  validateMetricsContext: any;
  setMetricsFlowCompleteSignal: any;
  emitMetricsEvent: any;
  stashMetricsContext: any;
  propagateMetricsContext: any;
  gatherMetricsContext: any;
}

export interface TaxAddress {
  countryCode: string;
  postalCode: string;
}

export interface ProfileClient {
  deleteCache(uid: string): Promise<void>;
  updateDisplayName(uid: string, name: string): Promise<void>;
}

export interface AuthLogger extends Logger {
  (tags: string | string[], data?: string | object): void;

  begin(location: string, request: AuthRequest): void;

  notifyAttachedServices(
    serviceName: string,
    request: AuthRequest,
    data: Record<string, any>
  ): Promise<void>;
}

// Exporting this here to avoid a circular dependency.  Can be moved to
// lib/account-delete if we are ever at full ESM.
export const AccountDeleteReasons = [
  'fxa_unverified_account_delete',
  'fxa_user_requested_account_delete',
] as const;

// Container token types
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AuthLogger = new Token<AuthLogger>('AUTH_LOGGER');
export const AuthFirestore = new Token<Firestore>('AUTH_FIRESTORE');
export const AppConfig = new Token<ConfigType>('APP_CONFIG');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ProfileClient = new Token<ProfileClient>('PROFILE_CLIENT');
