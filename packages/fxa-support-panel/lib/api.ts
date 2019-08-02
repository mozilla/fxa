/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as hapi from '@hapi/hapi';
import * as hapiJoi from '@hapi/joi';
import * as P from 'bluebird';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { Logger } from 'mozlog';
import * as path from 'path';
import * as requests from 'request-promise-native';
import * as joi from 'typesafe-joi';
import { string } from 'typesafe-joi';

export type SupportConfig = {
  authHeader: string;
  authdbUrl: string;
};

const queryValidator = joi
  .object()
  .keys({
    requestTicket: string().optional(),
    uid: joi.string().required()
  })
  .required();

type supportQuery = joi.Literal<typeof queryValidator>;

// Note that these are purely for access to known response keys and
// not an attempt to validate the return payloads from fxa-auth-db-mysql
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
  productName: string;
  createdAt: number;
}

export interface SubscriptionResponse extends Array<Subscription> {}

export interface TotpTokenResponse {
  sharedSecret: string;
  epoch: number;
  verified: boolean;
  enabled: boolean;
}

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
      json: true
    };
    // This is the user who is asking for the information:
    this.logger.info('infoRequest', {
      authUser: request.headers[this.config.authHeader.toLowerCase()],
      requestTicket,
      uid
    });
    let account: AccountResponse;
    let devices: DevicesResponse;
    let subscriptions: SubscriptionResponse;
    try {
      [account, devices, subscriptions] = await P.all([
        requests.get({ ...opts, url: `${this.config.authdbUrl}/account/${uid}` }),
        requests.get({ ...opts, url: `${this.config.authdbUrl}/account/${uid}/devices` }),
        requests.get({ ...opts, url: `${this.config.authdbUrl}/account/${uid}/subscriptions` })
      ]);
    } catch (err) {
      this.logger.error('infoFetch', { err });
      return h.response('<h1>Unable to fetch user</h1>').code(500);
    }
    let totpResponse: requests.FullResponse;
    let totpEnabled: boolean;
    try {
      totpResponse = await requests.get({
        json: true,
        resolveWithFullResponse: true,
        url: `${this.config.authdbUrl}/totp/${uid}`
      });
      totpEnabled = (totpResponse.body as TotpTokenResponse).enabled;
    } catch (err) {
      if (err.response && err.response.statusCode === 404) {
        totpEnabled = false;
      } else {
        this.logger.error('totpFetch', { err });
        return h.response('<h1>Unable to fetch user</h1>').code(500);
      }
    }
    const hasSubscriptions = subscriptions.length > 0 ? true : false;
    const context = {
      created: String(new Date(account.createdAt)),
      devices: devices.forEach(d => {
        return { name: d.name, type: d.type, created: String(new Date(d.createdAt)) };
      }),
      email: account.email,
      emailVerified: !!account.emailVerified,
      locale: account.locale,
      subscriptionStatus: hasSubscriptions,
      twoFactorAuth: totpEnabled,
      uid
    };
    const payload = this.template(context);
    return h.response(payload).code(200);
  }
}

export function init(logger: Logger, config: SupportConfig, server: hapi.Server) {
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
    encoding: 'UTF-8'
  });
  const template = handlebars.compile(pageTemplate);

  const supportController = new SupportController(logger, config, template);
  server.bind(supportController);

  server.route([
    {
      handler: supportController.heartbeat,
      method: 'GET',
      path: '/__lbheartbeat__'
    },
    {
      method: 'GET',
      options: {
        handler: supportController.displayUser,
        validate: {
          query: queryValidator as hapiJoi.ObjectSchema
        }
      },
      path: '/'
    }
  ]);
}
