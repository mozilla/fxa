/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { randomUUID } from 'crypto';
import { Logger } from 'mozlog';
import { Container } from 'typedi';
import { TypedCollectionReference } from 'typesafe-node-firestore';

import errors from '../../error';
import { AppConfig, AuthFirestore, AuthLogger } from '../../types';
import { PlanConfig } from './plan';
import { ProductConfig } from './product';

export class PaymentConfigManager {
  private firestore: Firestore;
  private productConfigDbRef: TypedCollectionReference<ProductConfig>;
  private planConfigDbRef: TypedCollectionReference<PlanConfig>;
  private log: Logger;
  private prefix: string;
  private cancelProductListener: (() => void) | undefined;
  private cancelPlanListener: (() => void) | undefined;

  private products: Record<string, ProductConfig> = {};
  private plans: Record<string, PlanConfig> = {};

  constructor() {
    const config = Container.get(AppConfig);
    this.prefix = `${config.authFirestore.prefix}payment-config-`;
    this.firestore = Container.get(AuthFirestore);
    this.log = Container.get(AuthLogger) as any as Logger;
    this.productConfigDbRef = this.firestore.collection(
      `${this.prefix}products`
    ) as TypedCollectionReference<ProductConfig>;
    this.planConfigDbRef = this.firestore.collection(
      `${this.prefix}plans`
    ) as TypedCollectionReference<PlanConfig>;
  }

  /**
   * Load all products and plans from firestore.
   *
   * Note that this will overwrite any existing products and plans.
   */
  public async load() {
    const [productResults, planResults] = await Promise.all([
      this.productConfigDbRef.select().get(),
      this.planConfigDbRef.select().get(),
    ]);
    productResults.docs.forEach((doc) => {
      this.products[doc.id] = ProductConfig.fromFirestoreObject(
        doc.data(),
        doc.id
      );
    });
    planResults.docs.forEach((doc) => {
      this.plans[doc.id] = PlanConfig.fromFirestoreObject(doc.data(), doc.id);
    });
  }

  /**
   * Start the listeners for changes to the product and plan configs.
   *
   * Note that this will exit the process if it fails to start the listeners.
   */
  public startListeners() {
    this.cancelProductListener = this.productConfigDbRef.onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (['added', 'modified'].includes(change.type)) {
            this.products[change.doc.id] = ProductConfig.fromFirestoreObject(
              change.doc.data(),
              change.doc.id
            );
          } else {
            if (change.doc.id in this.products) {
              delete this.products[change.doc.id];
            }
          }
        });
      },
      (err) => {
        this.log.error('startListener', { err });
        process.exit(1);
      }
    );
    this.cancelPlanListener = this.planConfigDbRef.onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (['added', 'modified'].includes(change.type)) {
            this.plans[change.doc.id] = PlanConfig.fromFirestoreObject(
              change.doc.data(),
              change.doc.id
            );
          } else {
            if (change.doc.id in this.plans) {
              delete this.plans[change.doc.id];
            }
          }
        });
      },
      (err) => {
        this.log.error('startListener', { err });
        process.exit(1);
      }
    );
  }

  /**
   * Stop the listeners for changes to the product and plan configs.
   */
  public stopListeners() {
    this.cancelProductListener?.();
    this.cancelPlanListener?.();
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
    productConfigId?: string
  ) {
    const { error } = await ProductConfig.validate(productConfig);
    if (error) {
      throw errors.internalValidationError(
        'storeProductConfig',
        productConfig,
        error
      );
    }
    const productId = productConfigId ?? randomUUID();
    await this.productConfigDbRef.doc(productId).set(productConfig);
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
    planConfigId?: string
  ) {
    const { error } = await PlanConfig.validate(planConfig);
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
    const planId = planConfigId ?? randomUUID();
    (planConfig as PlanConfig).productConfigId = productConfigId;
    await this.planConfigDbRef.doc(planId).set(planConfig);
    return planId;
  }

  public allProducts() {
    return Object.values(this.products);
  }

  public allPlans() {
    return Object.values(this.plans);
  }
}
