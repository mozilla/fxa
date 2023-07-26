/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */

import { Resolver, Query, Args } from '@nestjs/graphql';
import { Cms as CmsType } from './model/cms';
import { SingleCmsInput } from './dto/input/cms';

@Resolver('CMS')
export class CmsResolver {
  private cmses: CmsType[] = [
    {
      offering: 'vpn',
      productName: 'Mozilla VPN',
      details: ['detail 1', 'detail 2', 'detail 3'],
      termsOfService:
        'https://www.mozilla.org/about/legal/terms/subscription-services',
      termsOfServiceDownload:
        'https://payments-stage.fxa.nonprod.cloudops.mozgcp.net/legal-docs?url=https://accounts-static.cdn.mozilla.net/legal/subscription_services_tos',
      privacyNotice: 'https://www.mozilla.org/privacy/subscription-services',
    },
    {
      offering: 'relay',
      productName: 'Firefox Relay',
      details: ['relay 1', 'relay 2', 'relay 3'],
      termsOfService:
        'https://www.mozilla.org/about/legal/terms/subscription-services',
      termsOfServiceDownload:
        'https://payments-stage.fxa.nonprod.cloudops.mozgcp.net/legal-docs?url=https://accounts-static.cdn.mozilla.net/legal/subscription_services_tos',
      privacyNotice: 'https://www.mozilla.org/privacy/subscription-services',
    },
  ];

  @Query((returns) => CmsType, { name: 'singleCms' })
  getSingleCms(
    @Args('input', { type: () => SingleCmsInput }) input: SingleCmsInput
  ) {
    const { offering } = input;
    const cms = this.cmses.find((cms) => cms.offering === offering);

    if (!cms) throw new Error(`Could not find cms for offering: ${offering}`);

    return cms;
  }
}
