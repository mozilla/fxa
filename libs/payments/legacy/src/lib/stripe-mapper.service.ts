import { Stripe } from 'stripe';
import { ContentfulManager } from '@fxa/shared/contentful';
import { PlanMapperUtil } from './plan-mapper.util';

/**
 * Class to fetch Contentful config and map Contentful config to
 * Stripe metadata for an array of Stripe Plans.
 */
export class StripeMapperService {
  private nonMatchingPlans: string[] = [];
  constructor(private contentfulManager: ContentfulManager) {}

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

  /**
   * Merge Contentful config and Stripe metadata and assign to
   * plan and product metadata fields
   */
  async mapContentfulToStripePlans(
    plans: Stripe.Plan[],
    acceptLanguage: string
  ) {
    const mappedPlans: Stripe.Plan[] = [];
    const validPlanIds = plans.map((plan) => plan.id);

    const contentfulConfigUtil =
      await this.contentfulManager.getPurchaseWithDetailsOfferingContentByPlanIds(
        validPlanIds,
        acceptLanguage
      );

    for (const plan of plans) {
      if (!this.isProductObject(plan.product)) {
        mappedPlans.push(plan);
        this.nonMatchingPlans.push(`${plan.id} - Plan product not expanded`);
        continue;
      }

      const mergedStripeMetadata = {
        ...plan.product.metadata,
        ...plan.metadata,
      };

      const contentfulConfigData =
        contentfulConfigUtil.transformedPurchaseWithCommonContentForPlanId(
          plan.id
        );

      if (!contentfulConfigData) {
        mappedPlans.push(plan);
        this.nonMatchingPlans.push(`${plan.id} - No Contentful config`);
        continue;
      }

      const {
        offering: { commonContent },
        purchaseDetails,
      } = contentfulConfigData;

      const planMapper = new PlanMapperUtil(
        commonContent,
        purchaseDetails,
        mergedStripeMetadata
      );

      const { metadata, errorFields } = planMapper.mergeStripeAndContentful();

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
        this.nonMatchingPlans.push(`${plan.id} - ${errorFields.join(', ')}`);
      }
    }

    return {
      mappedPlans,
      nonMatchingPlans: this.nonMatchingPlans,
    };
  }
}
