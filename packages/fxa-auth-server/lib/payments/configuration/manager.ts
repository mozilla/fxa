/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { randomUUID } from 'crypto';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import errors from '../../error';
import { AppConfig, AuthFirestore, AuthLogger } from '../../types';

import {
  PaymentConfigManager as PaymentConfigManagerBase,
  PaymentConfigManagerError,
} from 'fxa-shared/payments/configuration/manager';
import { PlanConfig } from 'fxa-shared/subscriptions/configuration/plan';
import { ProductConfig } from 'fxa-shared/subscriptions/configuration/product';
import { mergeConfigs } from 'fxa-shared/subscriptions/configuration/utils';

export class PaymentConfigManager extends PaymentConfigManagerBase {
  protected mergeConfigs(
    planConfig: PlanConfig,
    productConfig: ProductConfig
  ): PlanConfig {
    return mergeConfigs(planConfig, productConfig);
  }

  constructor() {
    const config = Container.get(AppConfig);
    const firestore = Container.get(AuthFirestore);
    const log = Container.get(AuthLogger) as any as Logger;
    super(config, firestore, log);
  }

  /**
   * Store an object as a ProductConfig.
   *
   * This will validate the object is a ProductConfig before storing it, and
   * update the ProductConfig if a productConfigId is provided.
   *
   * Returns the productConfigId of the stored object.
   */
  public async storeProductConfig(
    productConfig: any,
    productConfigId?: string | null
  ) {
    return await this.asyncWrapValidationError(async () => {
      return await super.storeProductConfig(productConfig, productConfigId);
    });
  }

  /**
   * Store an object as a PlanConfig.
   *
   * Note that the ProductConfig for the plan must already exist.
   */
  public async storePlanConfig(
    planConfig: any,
    productConfigId: string,
    planConfigId?: string | null
  ) {
    return await this.asyncWrapValidationError(async () => {
      return await super.storePlanConfig(
        planConfig,
        productConfigId,
        planConfigId
      );
    });
  }

  /**
   * Get a complete, merged config for a plan, with the product's config merged
   * with the plan's.
   */
  getMergedConfig(planConfig: PlanConfig) {
    return this.wrapValidationError(() => {
      return super.getMergedConfig(planConfig);
    });
  }

  private async asyncWrapValidationError<T>(action: () => T) {
    try {
      console.log('K');
      return await action();
    } catch (err) {
      console.log('WUT', err);
      if (err instanceof PaymentConfigManagerError) {
        throw errors.internalValidationError(err.op, err.config, err.error);
      } else {
        throw err;
      }
    }
  }

  private wrapValidationError<T>(action: () => T) {
    try {
      return action();
    } catch (err) {
      console.log('WUT', err);
      if (err instanceof PaymentConfigManagerError) {
        throw errors.internalValidationError(err.op, err.config, err.error);
      } else {
        throw err;
      }
    }
  }
}
