/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { TypedCollectionReference } from '@fxa/vendored/typesafe-node-firestore';
import { PlanConfig } from '../../subscriptions/configuration/plan';
import { ProductConfig } from '../../subscriptions/configuration/product';
import { mergeConfigs } from '../../subscriptions/configuration/utils';
import { ILogger } from '../../log';
import { ProductConfigSchemaValidation } from '../../subscriptions/configuration/base';

/**
 * Wrapper for errors encountered by the payment config manager.
 */
export class PaymentConfigManagerError {
  constructor(
    public readonly op: string,
    public readonly data: any,
    public readonly error: Error
  ) {}
}

/**
 * Configuration state required by PaymentConfigManager
 */
export type PaymentConfigManagerConfig = {
  authFirestore: {
    prefix: string;
  };
  subscriptions: {
    productConfigsFirestore: {
      enabled: boolean;
      schemaValidation: ProductConfigSchemaValidation;
    };
  };
};

/**
 * Base class for PaymentConfigurationManager. Provides access to operations
 * shared across workspaces.
 */
export abstract class PaymentConfigManager {
  protected productConfigDbRef: TypedCollectionReference<ProductConfig>;
  protected planConfigDbRef: TypedCollectionReference<PlanConfig>;
  protected prefix: string;
  protected cancelProductListener: (() => void) | undefined;
  protected cancelPlanListener: (() => void) | undefined;

  protected products: Record<string, ProductConfig> = {};
  protected plans: Record<string, PlanConfig> = {};

  protected hasLoaded: boolean = false;

  constructor(
    protected readonly config: PaymentConfigManagerConfig,
    protected readonly firestore: Firestore,
    protected readonly log: ILogger
  ) {
    this.prefix = `${config.authFirestore.prefix}payment-config-`;
    this.productConfigDbRef = this.firestore.collection(
      `${this.prefix}products`
    ) as TypedCollectionReference<ProductConfig>;
    this.planConfigDbRef = this.firestore.collection(
      `${this.prefix}plans`
    ) as TypedCollectionReference<PlanConfig>;

    this.load();
    this.startListeners();
  }

  /**
   * Load all products and plans from firestore.
   *
   * Note that this will overwrite any existing products and plans.
   */
  public async load() {
    const [productResults, planResults] = await Promise.all([
      this.productConfigDbRef.get(),
      this.planConfigDbRef.get(),
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

    this.hasLoaded = true;
  }

  /**
   * Ensures that class has finished loading.
   */
  protected async maybeLoad() {
    this.hasLoaded || (await this.load());
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
   * Provides list of all products
   */
  public async allProducts() {
    await this.maybeLoad();
    return Object.values(this.products);
  }

  /**
   * Provides list of all plans
   */
  public async allPlans() {
    await this.maybeLoad();
    return Object.values(this.plans);
  }

  /**
   * Get a complete, merged config for a plan, with the product's config merged
   * with the plan's.
   */
  getMergedConfig(planConfig: PlanConfig) {
    const productConfig = this.products[planConfig.productConfigId];
    if (!productConfig) {
      throw new PaymentConfigManagerError(
        'getMergedConfig',
        planConfig,
        new Error('ProductConfig does not exist')
      );
    }
    return mergeConfigs(planConfig, productConfig);
  }
}
