/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
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

export class PaymentConfigManager extends PaymentConfigManagerBase {
  constructor() {
    const config = Container.get(AppConfig);
    const firestore = Container.get(AuthFirestore);
    const log = Container.get(AuthLogger) as any as Logger;
    super(config, firestore, log);
  }

  /**
   * Validate the ProductConfig object
   */
  public async validateProductConfig(productConfig: any) {
    const { error } = await ProductConfig.validate(
      productConfig,
      this.config.subscriptions.productConfigsFirestore.schemaValidation
    );
    if (error) {
      throw errors.internalValidationError(
        'storeProductConfig',
        productConfig,
        error
      );
    }
  }

  /**
   * Validate the PlanConfig object and that the Product Config already exists
   */
  public async validatePlanConfig(planConfig: any, productConfigId: string) {
    const { error } = await PlanConfig.validate(
      planConfig,
      this.config.subscriptions.productConfigsFirestore.schemaValidation
    );
    if (error) {
      throw errors.internalValidationError(
        'storePlanConfig',
        planConfig,
        error
      );
    }

    if (!this.products[productConfigId]) {
      throw errors.internalValidationError(
        'storePlanConfig',
        planConfig,
        new Error('ProductConfig does not exist')
      );
    }
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
    await this.validateProductConfig(productConfig);
    const productId = productConfigId ?? randomUUID();
    await this.productConfigDbRef.doc(productId).set(productConfig);
    const productSnapshot = await this.productConfigDbRef.doc(productId).get();
    this.products[productId] = ProductConfig.fromFirestoreObject(
      productSnapshot.data(),
      productSnapshot.id
    );
    return productId;
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
    await this.validatePlanConfig(planConfig, productConfigId);
    const planId = planConfigId ?? randomUUID();
    (planConfig as PlanConfig).productConfigId = productConfigId;
    await this.planConfigDbRef.doc(planId).set(planConfig);
    const planSnapshot = await this.planConfigDbRef.doc(planId).get();
    this.plans[planId] = PlanConfig.fromFirestoreObject(
      planSnapshot.data(),
      planSnapshot.id
    );
    return planId;
  }

  /**
   * Looks up a Firestore ProductConfig or PlanConfig document id based
   * on the provided Stripe Product or Plan id.
   */
  public async getDocumentIdByStripeId(
    stripeId: string
  ): Promise<string | null> {
    const products = await this.allProducts();
    const plans = await this.allPlans();
    const match =
      products.find((product) => product.stripeProductId === stripeId) ||
      plans.find((plan) => plan.stripePriceId === stripeId);

    return match?.id ?? null;
  }

  public async getMergedPlanConfiguration(planId: string) {
    const plans = await this.allPlans();
    const planConfig = plans.find((p) => p.stripePriceId === planId);

    return planConfig ? this.getMergedConfig(planConfig) : undefined;
  }

  /**
   * Get a complete, merged config for a plan, with the product's config merged
   * with the plan's.
   */
  getMergedConfig(planConfig: PlanConfig) {
    try {
      return super.getMergedConfig(planConfig);
    } catch (err) {
      if (err instanceof PaymentConfigManagerError) {
        throw errors.internalValidationError(err.op, err.data, err.error);
      } else {
        throw err;
      }
    }
  }
}
