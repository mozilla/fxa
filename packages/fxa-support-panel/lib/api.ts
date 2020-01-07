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
import { FxaRedisClient } from 'fxa-shared/redis';
import RedisSessionToken, { Token } from 'fxa-shared/redis-session-token';
import handlebars from 'handlebars';
import { Logger } from 'mozlog';
import path from 'path';
import requests from 'request-promise-native';
import joi from 'typesafe-joi';

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
  uid: string;
  subscriptionId: string;
  productId: string;
  createdAt: number;
}

export interface SubscriptionResponse extends Array<Subscription> {}

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
  redis: {
    host: string;
    port: number;
    sessionTokens: {
      enabled: boolean;
      prefix: string;
      maxConnections: number;
      minConnections: number;
    };
  };
};

class SupportController {
  constructor(
    private readonly logger: Logger,
    private readonly config: SupportConfig,
    private template: handlebars.TemplateDelegate<any>,
    private readonly redis: FxaRedisClient
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
    try {
      [account, devices, subscriptions] = await Promise.all(
        [
          `${this.config.authdbUrl}/account/${uid}`,
          `${this.config.authdbUrl}/account/${uid}/devices`,
          `${this.config.authdbUrl}/account/${uid}/subscriptions`,
        ].map(url => requests.get({ ...opts, url }))
      );
    } catch (err) {
      this.logger.error('infoFetch', { err });
      return h.response('<h1>Unable to fetch user</h1>').code(500);
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

    const tokenMetaData = await this.getTokenMetaData(uid);
    const signinLocations = Object.entries(tokenMetaData)
      .filter(([_, v]) => v.location)
      .map(([_, v]) => ({
        ...v.location,
        lastAccessTime: v.lastAccessTime
          ? String(new Date(v.lastAccessTime))
          : null,
      }));

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
      twoFactorAuth: totpEnabled,
      uid,
    };
    const payload = this.template(context);
    return h.response(payload).code(200);
  }

  private async getTokenMetaData(
    uid: string
  ): Promise<{ [id: string]: Token }> {
    try {
      const packedTokens = await this.redis.get(uid);
      return RedisSessionToken.unpackTokensFromRedis(packedTokens);
    } catch (err) {
      this.logger.error('redis.get', { err });
      return {};
    }
  }
}

/** Initialize the provided Hapi server with the support routes */
export function init(
  logger: Logger,
  config: SupportConfig,
  server: hapi.Server,
  redis: FxaRedisClient
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

  const supportController = new SupportController(
    logger,
    config,
    template,
    redis
  );
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
