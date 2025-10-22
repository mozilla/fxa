/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import iconSearch from '../../images/icon-search.svg';
import ErrorAlert from '../ErrorAlert';
import { BlockStatus } from './BlockStatus';
import { GET_RATE_LIMITS, CLEAR_RATE_LIMITS } from './index.gql';
import { BlockStatus as BlockStatusData } from 'fxa-admin-server/src/graphql';

interface RateLimitSearchState {
  ip: string;
  email: string;
  uid: string;
}

type RateLimitQuery = Partial<RateLimitSearchState>;

const createRateLimitQuery = (data: RateLimitSearchState): RateLimitQuery => {
  const [ip, email, uid] = [data.ip.trim(), data.email.trim(), data.uid.trim()];

  return {
    ip: ip || undefined,
    email: email || undefined,
    uid: uid || undefined,
  };
};

const validateQuery = (query: RateLimitQuery): boolean => {
  return Boolean(query.ip || query.email || query.uid);
};

export const PageRateLimiting = () => {
  const { register, handleSubmit, reset, getValues } =
    useForm<RateLimitSearchState>({
      defaultValues: {
        ip: '',
        email: '',
        uid: '',
      },
    });
  const [showResults, setShowResults] = useState<boolean>(false);

  const [getRateLimits, rateLimitsResult] = useLazyQuery<
    { rateLimits: BlockStatusData[] },
    RateLimitQuery
  >(GET_RATE_LIMITS);
  const [clearMutation] = useMutation<
    { clearRateLimits: number },
    RateLimitQuery
  >(CLEAR_RATE_LIMITS);

  const onSubmit = (data: RateLimitSearchState) => {
    const variables = createRateLimitQuery(data);

    if (!validateQuery(variables)) {
      window.alert('Please enter at least one of: IP address, email, or UID');
      return;
    }

    getRateLimits({ variables });
    setShowResults(true);

    // keep form values after submit
    reset(data);
  };

  const handleClear = async () => {
    const values = getValues();
    const variables = createRateLimitQuery(values);

    if (!validateQuery(variables)) {
      window.alert('Please enter at least one of: IP address, email, or UID');
      return;
    }

    try {
      const result = await clearMutation({
        variables,
        refetchQueries: [{ query: GET_RATE_LIMITS, variables }],
        awaitRefetchQueries: true,
      });
      const count = result.data?.clearRateLimits || 0;
      window.alert(`Successfully cleared ${count} rate limit record(s)`);
      // No need for manual refetch since refetchQueries handles it
    } catch (error) {
      window.alert(
        `Failed to clear: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      // keep form values after submit
      reset(values);
    }
  };

  const SearchField = ({
    id,
    label,
    type = 'text',
  }: {
    id: keyof RateLimitSearchState;
    label: string;
    type?: string;
  }) => {
    return (
      <div>
        <label
          htmlFor={`rate-limit-${id}`}
          className="block uppercase text-sm text-grey-500 mb-2"
        >
          {label}
        </label>
        <input
          id={`rate-limit-${id}`}
          name={id}
          type={type}
          placeholder={label}
          className="bg-grey-50 rounded w-full py-2 px-3 placeholder-grey-500"
          ref={register}
        />
      </div>
    );
  };

  return (
    <div>
      <h2 className="header-page">Rate Limiting</h2>
      <p className="mb-4">
        Search for active rate limiting blocks and bans by IP address, email,
        and/or UID. Please provide as much fields as possible for more accurate
        results.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SearchField id="ip" label="IP Address" />
          <SearchField id="email" label="Email" type="email" />
          <SearchField id="uid" label="UID" />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-grey-100 hover:bg-grey-200 text-black px-4 py-2 rounded flex items-center gap-2"
          >
            <img className="w-4 h-4" src={iconSearch} alt="search icon" />
            Search Rate Limits
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="bg-red-100 hover:bg-red-200 text-black px-4 py-2 rounded"
          >
            Clear Rate Limits
          </button>
        </div>
      </form>

      {showResults && <RateLimitResults rateLimitsResult={rateLimitsResult} />}
    </div>
  );
};

interface RateLimitResultsProps {
  rateLimitsResult: {
    loading: boolean;
    error?: ApolloError;
    data?: { rateLimits: BlockStatusData[] };
  };
}

const RateLimitResults = ({ rateLimitsResult }: RateLimitResultsProps) => {
  if (rateLimitsResult.loading) {
    return (
      <>
        <hr className="my-4" />
        <p className="mt-2">Loading rate limit information...</p>
      </>
    );
  }

  if (rateLimitsResult.error) {
    return (
      <>
        <hr className="my-4" />
        <ErrorAlert error={rateLimitsResult.error} />
      </>
    );
  }

  const allRateLimits = rateLimitsResult.data?.rateLimits || [];

  const blocks = allRateLimits.filter((item) => item.policy === 'block');
  const bans = allRateLimits.filter((item) => item.policy === 'ban');

  return (
    <>
      <hr className="my-4" />
      <div className="mt-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Active Blocks ({blocks.length})
          </h3>
          {blocks.length === 0 ? (
            <p className="text-grey-600">No active blocks found.</p>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => (
                <BlockStatus
                  key={`block-${block.action}-${block.blockingOn}-${block.startTime}`}
                  status={block}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Active Bans ({bans.length})
          </h3>
          {bans.length === 0 ? (
            <p className="text-grey-600">No active bans found.</p>
          ) : (
            <div className="space-y-3">
              {bans.map((ban) => (
                <BlockStatus
                  key={`ban-${ban.action}-${ban.blockingOn}-${ban.startTime}`}
                  status={ban}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageRateLimiting;
