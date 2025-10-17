/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLazyQuery, ApolloError } from '@apollo/client';
import iconSearch from '../../images/icon-search.svg';
import ErrorAlert from '../ErrorAlert';
import { BlockStatus } from './BlockStatus';
import { GET_RATE_LIMITS } from './index.gql';
import { BlockStatus as BlockStatusData } from 'fxa-admin-server/src/graphql';

interface RateLimitSearchState {
  ip: string;
  email: string;
  uid: string;
}

type RateLimitQuery = Partial<RateLimitSearchState>;

export const PageRateLimiting = () => {
  const { register, handleSubmit, reset } = useForm<RateLimitSearchState>({
    defaultValues: {
      ip: '',
      email: '',
      uid: '',
    },
  });
  const [showResults, setShowResults] = useState<boolean>(false);

  const [getRateLimits, rateLimitsResult] = useLazyQuery(GET_RATE_LIMITS);

  const onSubmit = (data: RateLimitSearchState) => {
    const { ip, email, uid } = data;
    if (!ip.trim() && !email.trim() && !uid.trim()) {
      window.alert('Please enter at least one of: IP address, email, or UID');
      return;
    }

    const variables: RateLimitQuery = {};
    if (ip.trim()) variables.ip = ip.trim();
    if (email.trim()) variables.email = email.trim();
    if (uid.trim()) variables.uid = uid.trim();

    getRateLimits({ variables });
    setShowResults(true);

    // keep form values after submit
    reset(data);
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

        <button
          type="submit"
          className="bg-grey-100 hover:bg-grey-200 text-black px-4 py-2 rounded flex items-center gap-2"
        >
          <img className="w-4 h-4" src={iconSearch} alt="search icon" />
          Search Rate Limits
        </button>
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
              {blocks.map((block, index) => (
                <BlockStatus key={`block-${index}`} status={block} />
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
              {bans.map((ban, index) => (
                <BlockStatus key={`ban-${index}`} status={ban} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageRateLimiting;
