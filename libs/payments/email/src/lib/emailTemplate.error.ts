/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * EmailTemplateError is not intended for direct use, except for type-checking errors.
 * When throwing a new EmailTemplateError, create a unique extension of the class.
 */
export class EmailTemplateError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      info,
      cause,
    });
    this.name = 'EmailTemplateError';
  }
}

export class EmailTemplateRetrieveComponentError extends EmailTemplateError {
  constructor(path: string, name: string) {
    super(`Failed to retrieve email component ${name} from path: ${path}`, {
      path,
      name,
    });
    this.name = 'EmailTemplateRetrieveComponentError';
  }
}
