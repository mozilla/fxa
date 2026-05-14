/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BusinessEntitlementCapabilityFactory,
  BusinessEntitlementEmailListMatcherFactory,
  BusinessEntitlementResultFactory,
  BusinessEntitlementServiceFactory,
  BusinessEntitlementsQueryFactory,
} from './factories';
import { BusinessEntitlementsResultUtil } from './util';

describe('BusinessEntitlementsResultUtil', () => {
  describe('findCapabilitiesForEmail', () => {
    it('returns empty when no email is supplied', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory()
      );
      expect(util.findCapabilitiesForEmail(undefined)).toEqual({});
      expect(util.findCapabilitiesForEmail('')).toEqual({});
      expect(util.findCapabilitiesForEmail(null)).toEqual({});
    });

    it('returns the same frozen empty object on every miss', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['allowlisted@example.com'],
                }),
              ],
            }),
          ],
        })
      );

      const a = util.findCapabilitiesForEmail('miss-one@example.com');
      const b = util.findCapabilitiesForEmail('miss-two@example.com');
      const c = util.findCapabilitiesForEmail(undefined);
      expect(a).toBe(b);
      expect(b).toBe(c);
      expect(Object.isFrozen(a)).toBe(true);
    });

    it('accepts the object-keyed Strapi emails shape', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              capabilities: [
                BusinessEntitlementCapabilityFactory({
                  slug: 'cap-obj',
                  services: [
                    BusinessEntitlementServiceFactory({
                      oauthClientId: 'client-obj',
                    }),
                  ],
                }),
              ],
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: {
                    'Obj-User@Example.com': true,
                    'other@example.com': true,
                  } as any,
                }),
              ],
            }),
          ],
        })
      );

      expect(util.findCapabilitiesForEmail('obj-user@example.com')).toEqual({
        'client-obj': ['cap-obj'],
      });
    });

    it('freezes the returned capability map and inner arrays', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              capabilities: [
                BusinessEntitlementCapabilityFactory({
                  slug: 'cap-frozen',
                  services: [
                    BusinessEntitlementServiceFactory({
                      oauthClientId: 'client-frozen',
                    }),
                  ],
                }),
              ],
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['user@example.com'],
                }),
              ],
            }),
          ],
        })
      );

      const result = util.findCapabilitiesForEmail('user@example.com');
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result['client-frozen'])).toBe(true);
    });

    it('matches an email-list matcher case-insensitively', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              capabilities: [
                BusinessEntitlementCapabilityFactory({
                  slug: 'cap-list',
                  services: [
                    BusinessEntitlementServiceFactory({
                      oauthClientId: 'client-list',
                    }),
                  ],
                }),
              ],
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['One@example.com', 'two@example.com'],
                }),
              ],
            }),
          ],
        })
      );

      expect(util.findCapabilitiesForEmail('TWO@EXAMPLE.COM')).toEqual({
        'client-list': ['cap-list'],
      });
      expect(util.findCapabilitiesForEmail('three@example.com')).toEqual({});
    });

    it('combines capabilities across multiple matching entitlements', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              capabilities: [
                BusinessEntitlementCapabilityFactory({
                  slug: 'cap-A',
                  services: [
                    BusinessEntitlementServiceFactory({
                      oauthClientId: 'client-X',
                    }),
                  ],
                }),
              ],
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['user@example.com'],
                }),
              ],
            }),
            BusinessEntitlementResultFactory({
              capabilities: [
                BusinessEntitlementCapabilityFactory({
                  slug: 'cap-B',
                  services: [
                    BusinessEntitlementServiceFactory({
                      oauthClientId: 'client-X',
                    }),
                    BusinessEntitlementServiceFactory({
                      oauthClientId: 'client-Y',
                    }),
                  ],
                }),
              ],
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['user@example.com'],
                }),
              ],
            }),
          ],
        })
      );

      expect(util.findCapabilitiesForEmail('user@example.com')).toEqual({
        'client-x': expect.arrayContaining(['cap-A', 'cap-B']),
        'client-y': ['cap-B'],
      });
    });

    it('skips capabilities with no services', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              capabilities: [
                BusinessEntitlementCapabilityFactory({
                  slug: 'cap-orphan',
                  services: [],
                }),
              ],
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['user@example.com'],
                }),
              ],
            }),
          ],
        })
      );

      expect(util.findCapabilitiesForEmail('user@example.com')).toEqual({});
    });

    it('returns empty when no matchers fire', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              matchers: [
                BusinessEntitlementEmailListMatcherFactory({
                  emails: ['someone-else@example.com'],
                }),
              ],
            }),
          ],
        })
      );

      expect(util.findCapabilitiesForEmail('user@example.com')).toEqual({});
    });

    it('ignores Error-typed matchers in the dynamic zone', () => {
      const util = new BusinessEntitlementsResultUtil(
        BusinessEntitlementsQueryFactory({
          businessEntitlements: [
            BusinessEntitlementResultFactory({
              matchers: [{ __typename: 'Error' } as any],
            }),
          ],
        })
      );

      expect(util.findCapabilitiesForEmail('user@example.com')).toEqual({});
    });
  });
});
