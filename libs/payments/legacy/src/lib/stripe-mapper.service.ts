import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { PlanMapperUtil } from './plan-mapper.util';
import { Cacheable } from '@type-cacheable/core';
import {
  CacheFirstStrategy,
  MemoryAdapter,
} from '@fxa/shared/db/type-cacheable';
import { StripeMapperConfig } from './stripe-mapper.config';
import { cacheKeyForMap } from './utils/cacheKeyForMap';

const DEFAULT_TTL_SECONDS = 60;

/**
 * Class to fetch CMS config and map CMS config to
 * Stripe metadata for an array of Stripe Plans.
 */
@Injectable()
export class StripeMapperService {
  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private config: StripeMapperConfig,
    @Inject(Logger) public log: LoggerService
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

  /**
   * Overlay CMS config onto plan/product metadata.
   */
  @Cacheable({
    cacheKey: (args) => cacheKeyForMap(args[0], args[1]),
    strategy: (_: any, context: StripeMapperService) => new CacheFirstStrategy(undefined, undefined, context.log),
    ttlSeconds: (_, context: StripeMapperService) =>
      context.config.ttl || DEFAULT_TTL_SECONDS,
    client: new MemoryAdapter(),
  })
  async mapCMSToStripePlans(plans: Stripe.Plan[], acceptLanguage: string) {
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
        continue;
      }

      const cmsConfigData =
        cmsConfigUtil.transformedPurchaseWithCommonContentForPlanId(plan.id);

      if (!cmsConfigData) {
        mappedPlans.push(plan);
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
        purchaseDetailsLocalizedAttributes
      );

      const metadata = planMapper.mapCMSToStripeMetadata();

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
    }

    return mappedPlans;
  }
}
