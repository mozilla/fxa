import { ApolloQueryResult } from '@apollo/client';
import { cloneDeep } from 'lodash';
import { Injectable } from '@nestjs/common';
import { SelectionSetNode } from 'graphql/language/ast';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

interface ContentfulSysId {
  sys: {
    id: string;
  };
}

interface ContentfulPaginatedRecord {
  items: unknown[];
}

@Injectable()
export class ContentfulPaginationHelper {
  constructor() {}

  getPageCount<Result, Variables>(
    query: TypedDocumentNode<Result, Variables>,
    queryResult: ApolloQueryResult<Result>,
    pageSize: number
  ) {
    const paginationPath = this.getPaginationPathForQuery(query);

    const paginationRefs = this.getRefsFromPath<
      Record<string, unknown>,
      ContentfulSysId
    >(queryResult, paginationPath);

    let total = 0;
    for (const ref of paginationRefs) {
      const refTotal =
        'total' in ref && typeof ref.total === 'number' && ref.total;
      if (!refTotal) {
        throw new Error(
          "You must include the 'total' field within your paginated query"
        );
      }

      total = Math.max(refTotal, total);
    }

    const pageCount = Math.ceil(total / pageSize);

    return pageCount;
  }

  merge<Result, Variables>(
    query: TypedDocumentNode<Result, Variables>,
    baseQueryResult: Result,
    newPageQueryResult: Result
  ) {
    const base = cloneDeep(baseQueryResult);
    const newPage = cloneDeep(newPageQueryResult);

    const paginationPath = this.getPaginationPathForQuery(query);

    const basePaginationRefs = this.getRefsFromPath<
      ContentfulPaginatedRecord,
      ContentfulSysId
    >(base, paginationPath);
    const newPaginationRefs = this.getRefsFromPath<
      ContentfulPaginatedRecord,
      ContentfulSysId
    >(newPage, paginationPath);

    if (
      basePaginationRefs.length > 1 ||
      newPaginationRefs.length > 1 ||
      paginationPath.includes('items')
    ) {
      const basePaginationRefsBySysId = {} as Record<
        string,
        ContentfulPaginatedRecord
      >;
      for (const record of basePaginationRefs) {
        if (!record.parentRef.sys?.id) {
          throw new Error('Must query for sys.id for any auto-paginated join');
        }
        basePaginationRefsBySysId[record.parentRef.sys.id] = record.ref;
      }

      for (const record of newPaginationRefs) {
        const baseRef = basePaginationRefsBySysId[record.parentRef.sys.id];
        if (!baseRef) {
          throw new Error('Contentful content changed during paginated load');
        }

        baseRef.items.push(...record.ref.items);
      }
    } else {
      const baseRef = basePaginationRefs.at(0);
      const newRef = newPaginationRefs.at(0);

      if (!baseRef || !newRef) {
        throw new Error('Missing refs to perform pagination join');
      }

      baseRef.ref.items.push(...(newPaginationRefs.at(0)?.ref.items || []));
    }

    return base;
  }

  private getPaginationPath(
    selectionSet: SelectionSetNode,
    basePath: string = ''
  ): string | undefined {
    for (const selection of selectionSet.selections) {
      if (selection.kind !== 'Field') {
        continue;
      }

      const path = `${basePath}.${selection.name.value}`;

      const isPaginated =
        selection.arguments &&
        selection.arguments.some(
          (argument) =>
            argument.value.kind === 'Variable' &&
            argument.value.name.value === 'skip'
        );

      if (isPaginated) {
        return path;
      }

      if (selection.selectionSet) {
        const childPath = this.getPaginationPath(selection.selectionSet, path);

        if (childPath) return childPath;
      }
    }

    return;
  }

  private getPaginationPathForQuery<Result, Variables>(
    query: TypedDocumentNode<Result, Variables>
  ): string[] {
    for (const definition of query.definitions) {
      const selectionSet =
        (definition?.kind === 'OperationDefinition' &&
          definition.selectionSet) ||
        undefined;
      if (!selectionSet) continue;

      const paginationPath = this.getPaginationPath(selectionSet);

      if (paginationPath) return paginationPath.split('.').filter((el) => el);
    }

    throw new Error('Query is not auto-paginatable');
  }

  private getRefsFromPath<RefType, RefParentType>(
    root: unknown,
    path: string[],
    lastParentWithSys?: unknown
  ): {
    ref: RefType;
    parentRef: RefParentType;
  }[] {
    if (!root) return [];
    if (path.length === 0)
      return [
        {
          ref: root as RefType,
          parentRef: lastParentWithSys as RefParentType,
        },
      ]; // Since typings here would be extremely complicated to narrow, we assume both the ref and parent type given the path comes from gql-codegen.

    if (typeof root !== 'object') {
      throw new Error(`Root is not an object, but rather: ${typeof root}`);
    }

    const newRoot = (root as Record<string, unknown>)[path[0]];
    if (!newRoot) throw new Error(`Path does not exist in result set: ${path}`);

    if (Array.isArray(newRoot)) {
      return newRoot
        .map((el) => {
          return this.getRefsFromPath<RefType, RefParentType>(
            el,
            path.slice(1),
            'sys' in root ? root : lastParentWithSys
          );
        })
        .flat();
    }

    return this.getRefsFromPath<RefType, RefParentType>(
      newRoot,
      path.slice(1),
      'sys' in root ? root : lastParentWithSys
    );
  }
}
