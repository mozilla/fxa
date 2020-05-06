import { Plan, ProductMetadata, ProductDetails } from './types';

const DEFAULT_LOCALE = 'en-US';

// Fallback to matches what was previously hardcoded in templates and FTL
const DEFAULT_SUBTITLE = 'Full-device VPN';
const DEFAULT_DETAILS = [
  'Device-level encryption',
  'Servers in 30+ countries',
  'Connect 5 devices with one subscription',
  'Available for Windows, iOS and Android',
];

// Support some default null values for product / plan metadata and
// allow plan metadata to override product metadata
// TODO: move to fxa-shared?
export const metadataFromPlan = (plan: Plan): ProductMetadata => ({
  productSet: null,
  productOrder: null,
  emailIconURL: null,
  webIconURL: null,
  upgradeCTA: null,
  downloadURL: null,
  ...plan.product_metadata,
  ...plan.plan_metadata,
});

/**
 * Parses through Stripe metadata for product detail strings and localized overrides
 *
 * Example metadata:
 *   product_metadata: {
 *     'product:subtitle': 'Great Full-device VPN',
 *     'product:details:3': 'Baz Connects 5 devices with one subscription',
 *     'product:details:1': 'Foo Device-level encryption',
 *     'product:details:2': 'Bar Servers in 30+ countries',
 *     'product:details:4': 'Quux Available for Windows, iOS and Android',
 *     'product:subtitle:xx-pirate': 'VPN fer yer full-device',
 *     'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android",
 *     'product:details:1:xx-pirate': 'Device-level encryption arr',
 *     'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
 *     'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
 *     'product:subtitle:xx-partial': 'Partial localization',
 *     'product:name:xx-partial': true,
 *   },
 *
 * @param plan {Plan}
 * @param userLocales list of locale strings (only the first is used)
 * @returns {ProductDetails}
 */
export const productDetailsFromPlan = (
  plan: Plan,
  userLocales: readonly string[] = [DEFAULT_LOCALE]
): ProductDetails => {
  // TODO: support overlaying multiple prioritized locale choices?
  const selectedLocale = userLocales[0];
  const metadata = {
    ...(plan.product_metadata || {}),
    ...(plan.plan_metadata || {}),
  };
  const details: {
    default: ProductDetails;
    selected: ProductDetails;
  } = {
    default: {},
    selected: {},
  };

  const detailsForLocale = (locale: string): ProductDetails => {
    switch (locale) {
      case selectedLocale:
        return details.selected;
      case DEFAULT_LOCALE:
        return details.default;
      default:
        return {};
    }
  };

  const productDetailKeys = Object.keys(metadata)
    // Limit to product detail metadata keys
    .filter(k => k.startsWith('product:'))
    // Sorting keys ensures proper order for lists
    .sort();

  for (const key of productDetailKeys) {
    const [_, propName, ...otherKeyParts] = key.split(':');

    const propValue = metadata[key];
    if (typeof propValue !== 'string') {
      continue;
    }

    switch (propName) {
      // Single string detail properties (just subtitle for now)
      case 'subtitle': {
        const [locale = DEFAULT_LOCALE] = otherKeyParts;
        detailsForLocale(locale)[propName] = propValue;
        break;
      }
      // List detail properties (just detail for now)
      case 'details': {
        const [_, locale = DEFAULT_LOCALE] = otherKeyParts;
        detailsForLocale(locale)[propName] = [
          ...(detailsForLocale(locale)[propName] || []),
          propValue,
        ];
        break;
      }
    }
  }

  return {
    ...{
      subtitle: DEFAULT_SUBTITLE,
      details: DEFAULT_DETAILS,
    },
    ...details.default,
    ...details.selected,
  };
};
