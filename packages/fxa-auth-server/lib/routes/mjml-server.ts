/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthRequest } from '../types';
import FluentLocalizer from '../../lib/senders/emails/fluent-localizer';
import { ConfigType } from '../../config';
import { object } from '@hapi/joi';

const fluentLocalizer = new FluentLocalizer();

export default (config: ConfigType) => {
  return {
    method: 'POST',
    path: '/mjml-server',
    options: {
      validate: {
        payload: object().required(),
      },
    },
    handler: async function (request: AuthRequest) {
      console.log(request.payload);

      const { template, layout, acceptLanguage, ...variables } =
        request.payload as Record<string, any>;

      return await fluentLocalizer.localizeEmail(
        template,
        layout || 'fxa',
        { ...variables, baseUrl: config.contentServer.url },
        acceptLanguage
      );
    },
  };
};
