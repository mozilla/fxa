/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { PlanConfig } from 'fxa-shared/subscriptions/configuration/plan';
import { ProductConfig } from 'fxa-shared/subscriptions/configuration/product';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import { PaymentConfigManager } from '../../lib/payments/configuration/manager';
import { commaSeparatedListToArray } from '../../lib/payments/utils';
import fs from 'fs/promises';
import path from 'path';
import AppError from '../../lib/error';

enum ConfigFileType {
  Product = 'product',
  Plan = 'plan',
  Invalid = 'invalid',
}

const validFileTypes = ['prod', 'plan', 'price'];

/**
 * Handles converting Stripe Products and Plans to Firestore ProductConfig
 * and PlanConfig Firestore documents. Updates existing documents if they
 * already exist.
 */
export class ProductsAndPlansConfigFromJSON {
  private log: Logger;
  private paymentConfigManager: PaymentConfigManager;

  constructor({ log }: { log: Logger }) {
    this.log = log;
    this.paymentConfigManager = Container.get(PaymentConfigManager);
  }

  getFileType(filename: string) {
    return filename.split('_')[0];
  }

  filterPaths(filePath: string) {
    const filename = path.basename(filePath);

    if (path.extname(filename) !== '.json') {
      return false;
    }

    if (!validFileTypes.includes(this.getFileType(filename))) {
      return false;
    }

    return true;
  }

  getConfigFileType(filePath: string) {
    const fileType = this.getFileType(path.basename(filePath));

    if (fileType === 'prod') {
      return ConfigFileType.Product;
    } else if (['plan', 'price'].includes(fileType)) {
      return ConfigFileType.Plan;
    } else {
      return ConfigFileType.Invalid;
    }
  }

  /**
   * Get all JSON
   */
  async readJSONFromDir(sourceDirectory: string): Promise<string[]> {
    const allPaths: string[] = [];
    const files = await fs.readdir(sourceDirectory);

    for (const file of files) {
      const filePath = path.join(sourceDirectory, file);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isFile()) {
        if (this.filterPaths(file)) {
          allPaths.push(filePath);
        }
      } else if (fileStat.isDirectory()) {
        const otherPaths = await this.readJSONFromDir(filePath);
        allPaths.push(...otherPaths);
      }
    }

    return allPaths;
  }

  async readJSONFromFile(sourceFile: string): Promise<string[]> {
    const fileData = await fs.readFile(sourceFile, { encoding: 'utf-8' });
    const entries = fileData.split('\n');
    const final = entries.map((entry) => {
      if (entry) {
        const temp = JSON.parse(entry);
        return temp[0];
      } else {
        return '';
      }
    });
    return final;
  }

  async readJSON(filePath: string) {
    const file = await fs.readFile(filePath, { encoding: 'utf-8' });
    return file;
  }

  async validateJSON(jsonPaths: string[]) {
    for await (const path of jsonPaths) {
      try {
        // From Path determine if its Product or Plan
        const configFileType = this.getConfigFileType(path);

        if (configFileType !== ConfigFileType.Invalid) {
          // Read JSON
          const jsonFile = await this.readJSON(path);
          // Convert to Product/Plan
          if (configFileType === ConfigFileType.Plan) {
            const plan: PlanConfig = JSON.parse(jsonFile);
            await this.paymentConfigManager.validatePlanConfig(
              plan,
              '34bd9547-9439-49e2-a1e9-068b2b2172b2',
              true
            );
            this.log.info('validateJSON.planSuccess', { filePath: path });
          } else if (configFileType === ConfigFileType.Product) {
            const product: ProductConfig = JSON.parse(jsonFile);
            await this.paymentConfigManager.validateProductConfig(product);
            this.log.info('validateJSON.productSuccess', { filePath: path });
          }
        }
      } catch (err) {
        if (err instanceof AppError) {
          if (err?.jse_cause) {
            this.log.error('validateJSON.validationError', {
              jse_cause: err.jse_cause,
              filePath: path,
            });
          } else {
            this.log.error('validateJSON.other', err);
          }
        }
      }
    }
  }

  /**
   * Iterates through all Stripe Plans for all Stripe Products to convert each
   * plan to a PlanConfig object and each product to a ProductConfig object,
   * moving localized metadata from the plan to the ProductConfig.
   *
   * Stores the PlanConfigs and ProductConfigs in Firestore as new document(s) if
   * none existed, else updates the existing Firestore document(s).
   *
   * Logs errors, but does not abort early on failure.
   *
   * If a `productId` is passed, processes all plans for the given product ID only.
   *
   * If `dryRun` is true, logs each Product and its ProductConfig and each plan
   * and its PlanConfig, but doesn't update Firestore.
   */
  async convert({
    isDryRun,
    sourceOption,
    sourceDirectory,
    sourceFile,
  }: {
    isDryRun: boolean;
    sourceOption: string;
    sourceDirectory: string;
    sourceFile: string;
  }): Promise<void> {
    this.log.debug('StripeProductsAndPlansConverter.convertBegin', {
      isDryRun,
      sourceOption,
      sourceDirectory,
      sourceFile,
    });

    try {
      const jsonPaths =
        sourceOption === 'directory'
          ? await this.readJSONFromDir(sourceDirectory)
          : await this.readJSONFromFile(sourceFile);
      if (jsonPaths.length) {
        await this.validateJSON(jsonPaths);
      } else {
        throw new Error('No JSON files were found.');
      }
    } catch (err) {
      this.log.error('convert.other', { message: err.message });
    }
  }
}
