/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { paginationTestQuery } from './queries/test/pagination';
import { nestedPaginationTestQuery } from './queries/test/nestedPagination';
import {
  NestedPaginationTestQueryFactory,
  PaginationTestQueryFactory,
} from './factories';
import { ContentfulPaginationHelper } from './contentful-pagination';

describe('ContentfulPaginationHelper', () => {
  let contentfulPaginationHelper: ContentfulPaginationHelper;

  beforeEach(() => {
    contentfulPaginationHelper = new ContentfulPaginationHelper();
  });

  describe('merge', () => {
    describe('success', () => {
      it('merges the paginated results with the base results', () => {
        const paginationPage1 = PaginationTestQueryFactory();
        const paginationPage2 = PaginationTestQueryFactory();

        const result = contentfulPaginationHelper.merge(
          paginationTestQuery,
          paginationPage1,
          paginationPage2
        );

        expect(result.offeringCollection?.items.length).toEqual(2);
      });

      it('merges multiple paginated results with the base results', () => {
        const paginationPage1 = PaginationTestQueryFactory();
        const paginationPage2 = PaginationTestQueryFactory();
        const paginationPage3 = PaginationTestQueryFactory();

        const result1 = contentfulPaginationHelper.merge(
          paginationTestQuery,
          paginationPage1,
          paginationPage2
        );

        const result2 = contentfulPaginationHelper.merge(
          paginationTestQuery,
          result1,
          paginationPage3
        );

        expect(result2.offeringCollection?.items.length).toEqual(3);
      });

      it('merges deeply nested paginated results with the base results', () => {
        const paginationPage1 = NestedPaginationTestQueryFactory();
        const paginationPage2 = NestedPaginationTestQueryFactory();
        paginationPage2.purchaseCollection!.items[0]!.sys.id =
          paginationPage1.purchaseCollection!.items[0]!.sys.id;

        const result = contentfulPaginationHelper.merge(
          nestedPaginationTestQuery,
          paginationPage1,
          paginationPage2
        );

        expect(result.purchaseCollection?.items.length).toEqual(1);
        expect(
          result.purchaseCollection?.items.at(0)?.offering
            ?.capabilitiesCollection?.items.length
        ).toEqual(2);
      });

      it('merges multiple deeply nested paginated results with the base results', () => {
        const paginationPage1 = NestedPaginationTestQueryFactory();
        const paginationPage2 = NestedPaginationTestQueryFactory();
        const paginationPage3 = NestedPaginationTestQueryFactory();
        paginationPage2.purchaseCollection!.items[0]!.sys.id =
          paginationPage1.purchaseCollection!.items[0]!.sys.id;
        paginationPage3.purchaseCollection!.items[0]!.sys.id =
          paginationPage1.purchaseCollection!.items[0]!.sys.id;

        const result1 = contentfulPaginationHelper.merge(
          nestedPaginationTestQuery,
          paginationPage1,
          paginationPage2
        );

        const result2 = contentfulPaginationHelper.merge(
          nestedPaginationTestQuery,
          result1,
          paginationPage3
        );

        expect(result2.purchaseCollection?.items.length).toEqual(1);
        expect(
          result2.purchaseCollection?.items.at(0)?.offering
            ?.capabilitiesCollection?.items.length
        ).toEqual(3);
      });
    });
  });
});
