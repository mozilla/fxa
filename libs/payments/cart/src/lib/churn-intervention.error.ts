/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class ChurchInterventionError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {info, cause});
    this.name = 'ChurchInterventionError';
  }
}

export class ChurnInterventionEntryAlreadyExistsError extends ChurchInterventionError {
  constructor(customerId: string, churnInterventionId: string) {
    super(
      'Churn Intervention with provided customerId and churnInterventionId already exists',
      { customerId, churnInterventionId }
    );
    this.name = 'ChurnInterventionEntryAlreadyExistsError';
  }
}

export class ChurnInterventionEntryCreateError extends ChurchInterventionError {
  constructor(customerId: string, churnInterventionId: string) {
    super(
      'Failed to create Churn Intervention Entry with provided customerId and churnInterventionId',
      { customerId, churnInterventionId }
    );
    this.name = 'ChurnInterventionEntryCreateError';
  }
}

export class ChurnInterventionEntryNotFoundError extends ChurchInterventionError {
  constructor(customerId: string, churnInterventionId: string) {
    super(
      'Churn Intervention with provided customerId and churnInterventionId not found',
      { customerId, churnInterventionId }
    );
    this.name = 'ChurnInterventionEntryNotFoundError';
  }
}

export class ChurnInterventionEntryMoreThanOneEntryExistsError extends ChurchInterventionError {
  constructor(customerId: string, churnInterventionId: string) {
    super(
      'More than one Churn Intervention entry exists with provided customerId and churnInterventionId',
      { customerId, churnInterventionId }
    );
    this.name = 'ChurnInterventionEntryMoreThanOneEntryExistsError';
  }
}

export class ChurnInterventionEntryIncorrectUpdateParamsError extends ChurchInterventionError {
  constructor(customerId: string, churnInterventionId: string) {
    super(
      'Must provide a positive integer to increment by',
      { customerId, churnInterventionId }
    );
    this.name = 'ChurnInterventionEntryIncorrectUpdateParamsError';
  }
}

export class ChurnInterventionEntryDeleteError extends ChurchInterventionError {
  constructor(customerId: string, churnInterventionId: string) {
    super(
      'Churn Intervention entry was not deleted',
      { customerId, churnInterventionId }
    );
    this.name = 'ChurnInterventionEntryDeleteError';
  }
}
