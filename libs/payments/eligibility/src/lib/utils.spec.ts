/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentOfferingResultFactory,
  EligibilityContentSubgroupOfferingResultFactory,
  type EligibilityContentSubgroupRankedOfferingResult,
  EligibilityContentSubgroupRankedOfferingResultFactory,
  EligibilityContentSubgroupResultFactory,
  EligibilityOfferingResultFactory,
  EligibilitySubgroupOfferingResultFactory,
  EligibilitySubgroupRankedOfferingResultFactory,
  EligibilitySubgroupResultFactory,
} from '@fxa/shared/cms';

import { SubgroupOfferingMissingPositionError } from './eligibility.error';
import { OfferingComparison } from './eligibility.types';
import { offeringComparison } from './utils';

const subgroupWithPositions = (
  groupName: string,
  offerings: Array<{ apiIdentifier: string; position: number | null }>
) =>
  EligibilityContentSubgroupResultFactory({
    groupName,
    offerings: offerings.map((offering) =>
      EligibilityContentSubgroupOfferingResultFactory({
        apiIdentifier: offering.apiIdentifier,
      })
    ),
    rankedOfferings: offerings.flatMap((offering) =>
      offering.position === null
        ? []
        : [
            EligibilityContentSubgroupRankedOfferingResultFactory({
              position: offering.position,
              offering: { apiIdentifier: offering.apiIdentifier },
            }),
          ]
    ),
  });

const offeringWithSubgroup = (
  apiIdentifier: string,
  offerings: Array<{ apiIdentifier: string; position: number | null }>,
  groupName = 'bundles'
) =>
  EligibilityContentOfferingResultFactory({
    apiIdentifier,
    subGroups: [subgroupWithPositions(groupName, offerings)],
  });

const planIdsOfferingWithSubgroup = (
  apiIdentifier: string,
  offerings: Array<{ apiIdentifier: string; position: number }>
) =>
  EligibilityOfferingResultFactory({
    apiIdentifier,
    subGroups: [
      EligibilitySubgroupResultFactory({
        offerings: offerings.map((offering) =>
          EligibilitySubgroupOfferingResultFactory({
            apiIdentifier: offering.apiIdentifier,
          })
        ),
        rankedOfferings: offerings.map((offering) =>
          EligibilitySubgroupRankedOfferingResultFactory({
            position: offering.position,
            offering: { apiIdentifier: offering.apiIdentifier },
          })
        ),
      }),
    ],
  });

describe('offeringComparison', () => {
  it('returns same when the target is the offering already subscribed to', () => {
    const targetOffering = offeringWithSubgroup('vpn', [
      { apiIdentifier: 'vpn', position: 10 },
    ]);

    expect(offeringComparison('vpn', targetOffering)).toBe(
      OfferingComparison.SAME
    );
  });

  it('returns null when the offerings share no subgroup', () => {
    const targetOffering = offeringWithSubgroup('vpn', [
      { apiIdentifier: 'vpn', position: 10 },
    ]);

    expect(offeringComparison('unrelated', targetOffering)).toBeNull();
  });

  describe('ranked by position', () => {
    it('returns upgrade when the target position is higher', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: 10 },
        { apiIdentifier: 'bundle', position: 20 },
      ]);

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.UPGRADE
      );
    });

    it('returns downgrade when the target position is lower', () => {
      const targetOffering = offeringWithSubgroup('vpn', [
        { apiIdentifier: 'vpn', position: 10 },
        { apiIdentifier: 'bundle', position: 20 },
      ]);

      expect(offeringComparison('bundle', targetOffering)).toBe(
        OfferingComparison.DOWNGRADE
      );
    });

    it('returns upgrade when the subgroup order contradicts the positions', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'bundle', position: 20 },
        { apiIdentifier: 'vpn', position: 10 },
      ]);

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.UPGRADE
      );
    });

    it('returns downgrade when the subgroup order contradicts the positions', () => {
      const targetOffering = offeringWithSubgroup('vpn', [
        { apiIdentifier: 'bundle', position: 20 },
        { apiIdentifier: 'vpn', position: 10 },
      ]);

      expect(offeringComparison('bundle', targetOffering)).toBe(
        OfferingComparison.DOWNGRADE
      );
    });

    it('returns upgrade across a position gap', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: 10 },
        { apiIdentifier: 'relay', position: 20 },
        { apiIdentifier: 'bundle', position: 30 },
      ]);

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.UPGRADE
      );
    });

    it('treats a position of 0 as a position rather than as absent', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'free', position: 0 },
        { apiIdentifier: 'bundle', position: 20 },
      ]);

      expect(offeringComparison('free', targetOffering)).toBe(
        OfferingComparison.UPGRADE
      );
    });

    it('returns upgrade for the by-plan-ids query shape', () => {
      const targetOffering = planIdsOfferingWithSubgroup('bundle', [
        { apiIdentifier: 'bundle', position: 20 },
        { apiIdentifier: 'vpn', position: 10 },
      ]);

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.UPGRADE
      );
    });

    it('returns downgrade for the by-plan-ids query shape', () => {
      const targetOffering = planIdsOfferingWithSubgroup('vpn', [
        { apiIdentifier: 'bundle', position: 20 },
        { apiIdentifier: 'vpn', position: 10 },
      ]);

      expect(offeringComparison('bundle', targetOffering)).toBe(
        OfferingComparison.DOWNGRADE
      );
    });
  });

  describe('missing positions', () => {
    it('throws when neither offering has a position', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: null },
        { apiIdentifier: 'bundle', position: null },
      ]);

      expect(() => offeringComparison('vpn', targetOffering)).toThrow(
        SubgroupOfferingMissingPositionError
      );
    });

    it('throws when the offering subscribed to has no position', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: null },
        { apiIdentifier: 'bundle', position: 20 },
      ]);

      expect(() => offeringComparison('vpn', targetOffering)).toThrow(
        SubgroupOfferingMissingPositionError
      );
    });

    it('throws when the target offering has no position', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: 10 },
        { apiIdentifier: 'bundle', position: null },
      ]);

      expect(() => offeringComparison('vpn', targetOffering)).toThrow(
        SubgroupOfferingMissingPositionError
      );
    });

    it('throws when the subgroup has no rankedOfferings at all', () => {
      const targetOffering = offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: null },
        { apiIdentifier: 'bundle', position: null },
      ]);
      targetOffering.subGroups[0].rankedOfferings =
        null as unknown as EligibilityContentSubgroupRankedOfferingResult[];

      expect(() => offeringComparison('vpn', targetOffering)).toThrow(
        SubgroupOfferingMissingPositionError
      );
    });
  });

  describe('offerings sharing a position', () => {
    it('returns same, so neither is an upgrade of the other', () => {
      const targetOffering = offeringWithSubgroup('relay', [
        { apiIdentifier: 'vpn', position: 10 },
        { apiIdentifier: 'relay', position: 10 },
      ]);

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.SAME
      );
    });
  });

  describe('partially ranked subgroup', () => {
    const unrankedSibling = () =>
      offeringWithSubgroup('bundle', [
        { apiIdentifier: 'vpn', position: 10 },
        { apiIdentifier: 'relay', position: null },
        { apiIdentifier: 'bundle', position: 20 },
      ]);

    it('still ranks by position when only an uninvolved offering is missing one', () => {
      expect(offeringComparison('vpn', unrankedSibling())).toBe(
        OfferingComparison.UPGRADE
      );
    });

  });

  describe('multiple common subgroups', () => {
    const twoCommonSubgroups = (
      first: Array<{ apiIdentifier: string; position: number | null }>,
      second: Array<{ apiIdentifier: string; position: number | null }>
    ) =>
      EligibilityContentOfferingResultFactory({
        apiIdentifier: 'bundle',
        subGroups: [
          subgroupWithPositions('first', first),
          subgroupWithPositions('second', second),
        ],
      });

    it('uses the positions of the first common subgroup', () => {
      const targetOffering = twoCommonSubgroups(
        [
          { apiIdentifier: 'vpn', position: 10 },
          { apiIdentifier: 'bundle', position: 20 },
        ],
        [
          { apiIdentifier: 'vpn', position: 30 },
          { apiIdentifier: 'bundle', position: 20 },
        ]
      );

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.UPGRADE
      );
    });

    it('ignores an earlier subgroup that the from offering is absent from', () => {
      const targetOffering = twoCommonSubgroups(
        [
          { apiIdentifier: 'relay', position: 10 },
          { apiIdentifier: 'bundle', position: 20 },
        ],
        [
          { apiIdentifier: 'vpn', position: 30 },
          { apiIdentifier: 'bundle', position: 20 },
        ]
      );

      expect(offeringComparison('vpn', targetOffering)).toBe(
        OfferingComparison.DOWNGRADE
      );
    });
  });
});
