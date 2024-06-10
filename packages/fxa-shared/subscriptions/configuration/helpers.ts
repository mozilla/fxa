import parser from 'accept-language-parser';

import {
  DEFAULT_PRODUCT_DETAILS,
  metadataFromPlan,
  productDetailsFromPlan,
} from '../metadata';
import { Plan } from '../types';
import { ProductConfigLocalesConfig } from './product';

const DEFAULT_LOCALE = 'en';

export const getPlanProductConfig = (plan: Plan) => {
  const configuration = plan.configuration;

  if (!configuration) {
    throw new Error(`Plan configuration not found. (${plan.plan_id})`);
  }

  return configuration;
};

export const flattenProductConfigLocalesData = (
  plan: Plan,
  userLocales: readonly string[] = [DEFAULT_LOCALE]
) => {
  let output: ProductConfigLocalesConfig;

  const planConfiguration = getPlanProductConfig(plan);

  const availableLocales =
    (planConfiguration.locales && Object.keys(planConfiguration.locales)) || [];
  availableLocales.push(DEFAULT_LOCALE);
  const selectedLocale = parser.pick(availableLocales, userLocales.join(','));

  output = {
    uiContent: planConfiguration.uiContent,
    urls: planConfiguration.urls,
    support: planConfiguration.support,
  };

  if (
    planConfiguration.locales &&
    selectedLocale &&
    planConfiguration.locales[selectedLocale]
  ) {
    const localesConfig = planConfiguration.locales[selectedLocale];
    output = {
      uiContent: {
        ...output.uiContent,
        ...localesConfig.uiContent,
      },
      urls: {
        ...output.urls,
        ...localesConfig.urls,
      },
      support: {
        ...output.support,
        ...localesConfig.support,
      },
    };
  }

  return output;
};

export const urlsFromProductConfig = (
  plan: Plan,
  userLocales: readonly string[] = [DEFAULT_LOCALE],
  useFirestoreProductConfigs: boolean
) => {
  if (useFirestoreProductConfigs) {
    return flattenProductConfigLocalesData(plan, userLocales).urls;
  } else {
    const planMetadataConfig = productDetailsFromPlan(plan, userLocales);

    return {
      termsOfService:
        planMetadataConfig.termsOfServiceURL ||
        DEFAULT_PRODUCT_DETAILS.termsOfServiceURL!,
      termsOfServiceDownload:
        planMetadataConfig.termsOfServiceDownloadURL ||
        DEFAULT_PRODUCT_DETAILS.termsOfServiceDownloadURL!,
      privacyNotice:
        planMetadataConfig.privacyNoticeURL ||
        DEFAULT_PRODUCT_DETAILS.privacyNoticeURL!,
      privacyNoticeDownload:
        planMetadataConfig.privacyNoticeDownloadURL ||
        DEFAULT_PRODUCT_DETAILS.privacyNoticeDownloadURL!,
      cancellationSurvey: planMetadataConfig.cancellationSurveyURL,
      successActionButton:
        plan.plan_metadata?.successActionButtonURL ||
        plan.product_metadata?.successActionButtonURL,
    };
  }
};

export const webIconConfigFromProductConfig = (
  plan: Plan,
  userLocales: readonly string[] = [DEFAULT_LOCALE],
  useFirestoreProductConfigs: boolean
) => {
  if (useFirestoreProductConfigs) {
    const planConfiguration = getPlanProductConfig(plan);
    const urls = flattenProductConfigLocalesData(plan, userLocales).urls;

    return {
      webIcon: urls.webIcon,
      webIconBackground: planConfiguration.styles?.webIconBackground,
    };
  } else {
    const combinedMetadata = metadataFromPlan(plan);

    return {
      webIcon: combinedMetadata.webIconURL,
      webIconBackground: combinedMetadata.webIconBackground,
    };
  }
};

export const uiContentFromProductConfig = (
  plan: Plan,
  userLocales: readonly string[] = [DEFAULT_LOCALE],
  useFirestoreProductConfigs: boolean
) => {
  if (useFirestoreProductConfigs) {
    return flattenProductConfigLocalesData(plan, userLocales).uiContent;
  } else {
    const metadata = metadataFromPlan(plan);
    const detailsFromPlan = productDetailsFromPlan(plan, userLocales);

    return {
      subtitle: detailsFromPlan.subtitle,
      details: detailsFromPlan.details,
      successActionButtonLabel: detailsFromPlan.successActionButtonLabel,
      upgradeCTA: metadata.upgradeCTA,
    };
  }
};

export const productUpgradeFromProductConfig = (
  plan: Plan,
  useFirestoreProductConfigs: boolean
) => {
  if (useFirestoreProductConfigs) {
    const { productOrder, productSet } = getPlanProductConfig(plan);
    return {
      productOrder:
        (productOrder !== undefined && `${productOrder}`) || undefined,
      productSet: productSet,
    };
  } else {
    const metadata = metadataFromPlan(plan);
    return {
      productOrder: metadata.productOrder,
      productSet: metadata.productSet,
    };
  }
};
