/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Hapi routes and controller for support panel.
 *
 * @module
 */
import hapi from '@hapi/hapi';
import hapiJoi from '@hapi/joi';
import fs from 'fs';
import handlebars from 'handlebars';
import { Logger } from 'mozlog';
import path from 'path';
import requests from 'request-promise-native';
import joi from 'typesafe-joi';

const MS_IN_SEC = 1000;

const queryValidator = joi
  .object()
  .keys({
    requestTicket: joi
      .number()
      .integer()
      .optional(),
    uid: joi
      .string()
      .required()
      .hex()
      .length(32),
  })
  .required();

type supportQuery = joi.Literal<typeof queryValidator>;

// Note that these `*.Response` interfaces are purely for access to known
// response keys and not an attempt to validate the return payloads from
// fxa-auth-db-mysql.
export interface AccountResponse {
  email: string;
  emailVerified: boolean;
  locale: string;
  createdAt: number;
}

interface Device {
  name: string;
  type: string;
  createdAt: number;
}

export interface DevicesResponse extends Array<Device> {}

interface Subscription {
  created: number;
  current_period_end: number;
  current_period_start: number;
  plan_changed: number | null;
  previous_product: string | null;
  product_name: string;
  status: string;
  subscription_id: string;
}

export interface SubscriptionResponse extends Array<Subscription> {}

interface SigninLocation {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  lastAccessTime: number | Date;
}

export interface SigninLocationResponse extends Array<SigninLocation> {}

export interface TotpTokenResponse {
  sharedSecret: string;
  epoch: number;
  verified: boolean;
  enabled: boolean;
}

/** SupportController configuration */
export type SupportConfig = {
  authHeader: string;
  authdbUrl: string;
  authServer: {
    secretBearerToken: string;
    signinLocationsSearchPath: string;
    subscriptionsSearchPath: string;
    url: string;
  };
};

class SupportController {
  constructor(
    private readonly logger: Logger,
    private readonly config: SupportConfig,
    private template: handlebars.TemplateDelegate<any>
  ) {}

  public async heartbeat(request: hapi.Request, h: hapi.ResponseToolkit) {
    return h.response({}).code(200);
  }

  public async displayUser(request: hapi.Request, h: hapi.ResponseToolkit) {
    const query = request.query as supportQuery;
    const uid = query.uid;
    const requestTicket = query.requestTicket || 'ticket-unknown';
    const opts = {
      json: true,
    };
    // This is the user who is asking for the information:
    this.logger.info('infoRequest', {
      authUser: request.headers[this.config.authHeader.toLowerCase()],
      requestTicket,
      uid,
    });

    let account: AccountResponse;
    let devices: DevicesResponse;
    let subscriptions: SubscriptionResponse;
    let signinLocations: SigninLocationResponse = [];

    const accountInfoReqPromises = [
      `${this.config.authdbUrl}/account/${uid}`,
      `${this.config.authdbUrl}/account/${uid}/devices`,
    ].map(url => requests.get({ ...opts, url }));

    try {
      [account, devices] = await Promise.all(accountInfoReqPromises);
    } catch (err) {
      this.logger.error('infoFetch', { err });
      return h.response('<h1>Unable to fetch user</h1>').code(500);
    }

    const authServerRequestOptions = {
      ...opts,
      headers: {
        Authorization: `Bearer ${this.config.authServer.secretBearerToken}`,
      },
    };

    try {
      subscriptions = await requests.get({
        ...authServerRequestOptions,
        url: `${this.config.authServer.url}${
          this.config.authServer.subscriptionsSearchPath
        }?uid=${uid}&email=${encodeURIComponent(account.email)}`,
      });
    } catch (err) {
      this.logger.error('subscriptionsFetch', { err });
      return h.response('<h1>Unable to fetch subscriptions</h1>').code(500);
    }

    const formattedSubscriptions = subscriptions.map(s => ({
      ...s,
      created: String(new Date(s.created * MS_IN_SEC)),
      current_period_end: String(new Date(s.current_period_end * MS_IN_SEC)),
      current_period_start: String(
        new Date(s.current_period_start * MS_IN_SEC)
      ),
      plan_changed: s.plan_changed
        ? String(new Date(s.plan_changed * MS_IN_SEC))
        : 'N/A',
      previous_product: s.previous_product || 'N/A',
    }));

    try {
      const locations: SigninLocationResponse = await requests.get({
        ...authServerRequestOptions,
        url: `${this.config.authServer.url}${this.config.authServer.signinLocationsSearchPath}?uid=${uid}`,
      });
      signinLocations = locations.map(v => ({
        ...v,
        lastAccessTime: new Date(v.lastAccessTime),
      }));
    } catch (err) {
      this.logger.error('locationsFetch', { err });
    }

    let totpEnabled: boolean;
    try {
      const totpResponse = await requests.get({
        json: true,
        resolveWithFullResponse: true,
        url: `${this.config.authdbUrl}/totp/${uid}`,
      });
      totpEnabled = (totpResponse.body as TotpTokenResponse).enabled;
    } catch (err) {
      if (err.response?.statusCode === 404) {
        totpEnabled = false;
      } else {
        this.logger.error('totpFetch', { err });
        return h.response('<h1>Unable to fetch user</h1>').code(500);
      }
    }

    const context = {
      created: String(new Date(account.createdAt)),
      devices: devices.map(d => {
        return {
          created: String(new Date(d.createdAt)),
          name: d.name,
          type: d.type,
        };
      }),
      email: account.email,
      emailVerified: !!account.emailVerified,
      locale: account.locale,
      signinLocations,
      subscriptionStatus: subscriptions.length > 0,
      subscriptions: formattedSubscriptions,
      twoFactorAuth: totpEnabled,
      uid,
    };
    const payload = this.template(context);
    return h.response(payload).code(200);
  }
}

/** Initialize the provided Hapi server with the support routes */
export function init(
  logger: Logger,
  config: SupportConfig,
  server: hapi.Server
) {
  let rootDir;
  // Check to see if we're running in a compiled form for prod/dev or testing
  if (__dirname.includes('/dist/')) {
    // Compiled, move up 2 directories
    rootDir = path.dirname(path.dirname(__dirname));
  } else {
    // Testing, move up one directory
    rootDir = path.dirname(__dirname);
  }
  const templateDir = path.join(rootDir, 'lib', 'templates');
  const pageTemplate = fs.readFileSync(path.join(templateDir, 'index.html'), {
    encoding: 'UTF-8',
  });
  const template = handlebars.compile(pageTemplate);

  const supportController = new SupportController(logger, config, template);
  server.bind(supportController);

  server.route([
    {
      handler: supportController.heartbeat,
      method: 'GET',
      path: '/__lbheartbeat__',
    },
    {
      method: 'GET',
      options: {
        handler: supportController.displayUser,
        validate: {
          query: (queryValidator as unknown) as hapiJoi.ObjectSchema,
        },
      },
      path: '/',
    },
  ]);
}
