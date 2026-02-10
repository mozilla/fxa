/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class CmsWebhookError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'CmsWebhookError';
  }
}

export class CmsWebhookAuthError extends CmsWebhookError {
  constructor() {
    super('CMS webhook authorization failed', {});
    this.name = 'CmsWebhookAuthError';
  }
}
