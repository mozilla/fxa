import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { PlanMapperUtil } from './plan-mapper.util';

/**
 * Class to fetch CMS config and map CMS config to
 * Stripe metadata for an array of Stripe Plans.
 */
@Injectable()
export class StripeMapperService {
  private errorIds = new Map<string, Set<string>>();
  private successfulIds = new Set();
  constructor(
    private productConfigurationManager: ProductConfigurationManager
  ) {}

  /**
   *  TypeGuard to ensure product on plan is a Product Object
   */
  private isProductObject(
    product: Stripe.Plan['product']
  ): product is Stripe.Product {
    if (typeof product !== 'string' && product && !product.deleted) {
      return true;
    } else {
      return false;
    }
  }

  private addErrorFields(id: string, messages: string[]) {
    // First check if ID is already in success Map. If it is, do not log.
    if (this.successfulIds.has(id)) {
      return;
    }
    // Limit to 1 message per productId
    const errorIdValue = this.errorIds.get(id) || new Set<string>();
    messages.forEach((message) => errorIdValue.add(message));
    this.errorIds.set(id, errorIdValue);
  }

  private addSuccessfulIds(id: string) {
    //Add success
    this.successfulIds.add(id);
    //Remove error
    this.errorIds.delete(id);
  }

  private getErrorMessages() {
    const errorMessages: string[] = [];

    this.errorIds.forEach((messages, id) => {
      errorMessages.push(`${id} - ${[...messages].join(', ')}`);
    });

    return errorMessages;
  }

  /**
   * Merge CMS config and Stripe metadata and assign to
   * plan and product metadata fields
   */
  async mapCMSToStripePlans(
    plans: Stripe.Plan[],
    acceptLanguage: string,
    cmsEnabled: boolean
  ) {
    const mappedPlans: Stripe.Plan[] = [];
    const validPlanIds = plans.map((plan) => plan.id);

    const cmsConfigUtil =
      await this.productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
        validPlanIds,
        acceptLanguage
      );

    for (const plan of plans) {
      if (!this.isProductObject(plan.product)) {
        mappedPlans.push(plan);
        this.addErrorFields(plan.id, ['Plan product not expanded']);
        continue;
      }

      const mergedStripeMetadata = {
        ...plan.product.metadata,
        ...plan.metadata,
      };

      const cmsConfigData =
        cmsConfigUtil.transformedPurchaseWithCommonContentForPlanId(plan.id);

      if (!cmsConfigData) {
        mappedPlans.push(plan);
        this.addErrorFields(plan.id, ['No CMS config']);
        continue;
      }

      const commonContentAttributes = cmsConfigData.offering.commonContent;
      const commonContentAttributesLocalized = commonContentAttributes
        .localizations.length
        ? commonContentAttributes.localizations[0]
        : commonContentAttributes;

      const purchaseDetailsAttributes = cmsConfigData.purchaseDetails;
      const purchaseDetailsLocalizedAttributes = purchaseDetailsAttributes
        .localizations.length
        ? purchaseDetailsAttributes.localizations[0]
        : purchaseDetailsAttributes;

      const planMapper = new PlanMapperUtil(
        commonContentAttributesLocalized,
        purchaseDetailsLocalizedAttributes,
        mergedStripeMetadata,
        cmsEnabled
      );

      const { metadata, errorFields } = planMapper.mergeStripeAndCMS();

      mappedPlans.push({
        ...plan,
        metadata: {
          ...plan.metadata,
          ...metadata,
        },
        product: {
          ...plan.product,
          metadata: {
            ...plan.product.metadata,
            ...metadata,
          },
        },
      });

      if (errorFields.length) {
        this.addErrorFields(plan.product.id, errorFields);
      } else {
        this.addSuccessfulIds(plan.product.id);
      }
    }

    return {
      mappedPlans,
      nonMatchingPlans: this.getErrorMessages(),
    };
  }
}
