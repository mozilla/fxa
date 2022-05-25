/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ApolloError, gql, useQuery } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { RelyingParty } from 'fxa-admin-server/src/graphql';
import { DATE_FORMAT } from '../AccountSearch/Account';
import dateFormat from 'dateformat';

const RELYING_PARTIES_SCHEMA = `
  relyingParties {
    id
    name
    imageUri
    redirectUri
    canGrant
    publicClient
    createdAt
    trusted
    allowedScopes
  }
`;

interface RelyingPartiesData {
  relyingParties: RelyingParty[];
}

export const GET_RELYING_PARTIES = gql`
  query getRelyingParties {
    ${RELYING_PARTIES_SCHEMA}
  }
`;

const Result = ({
  loading,
  error,
  data,
}: {
  loading?: boolean;
  error?: ApolloError;
  data?: RelyingPartiesData;
}) => {
  if (loading) {
    return <p className="mt-2">Loading...</p>;
  }
  if (error) {
    return <p className="mt-2">An error occurred.</p>;
  }
  if (data && data.relyingParties.length > 0) {
    return (
      <>
        {data.relyingParties.map(
          ({
            id,
            name,
            imageUri,
            redirectUri,
            canGrant,
            publicClient,
            createdAt,
            trusted,
            allowedScopes,
          }) => (
            <div key={id}>
              <h3 className="account-header">{name}</h3>
              <table className="account-border-info">
                <tbody>
                  <tr>
                    <th>ID</th>
                    <td>{id}</td>
                  </tr>
                  <tr>
                    <th>Created At</th>
                    <td>{dateFormat(new Date(createdAt), DATE_FORMAT)}</td>
                  </tr>
                  <tr>
                    <th>Redirect URI</th>
                    <td>{redirectUri}</td>
                  </tr>
                  <tr>
                    <th className="align-top">Allowed Scopes</th>
                    <td>
                      <AllowedScopes {...{ allowedScopes }} />
                    </td>
                  </tr>
                  <tr>
                    <th>Trusted?</th>
                    <td>{trusted ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <th>Can Grant?</th>
                    <td>{canGrant ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <th>Public Client?</th>
                    <td>{publicClient ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <th>Image URI</th>
                    <td>
                      {imageUri ? (
                        imageUri
                      ) : (
                        <span className="result-grey">(empty string)</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        )}
      </>
    );
  }

  return (
    <p>
      No relying parties were found. If you're seeing this locally, try creating
      an account to seed the database.
    </p>
  );
};

const AllowedScopes = ({
  allowedScopes,
}: {
  allowedScopes?: string | null;
}) => {
  if (!allowedScopes) {
    return <span className="result-grey">NULL</span>;
  }
  const arrAllowedScopes = allowedScopes.split(' ');
  if (arrAllowedScopes.length === 1) {
    return <>{allowedScopes}</>;
  }
  return (
    <ul className="list-disc">
      {arrAllowedScopes.map((scope, index) => (
        <li className="ml-4" key={`${index}-${scope}`}>
          {scope}
        </li>
      ))}
    </ul>
  );
};

export const PageRelyingParties = () => {
  const { loading, error, data } =
    useQuery<RelyingPartiesData>(GET_RELYING_PARTIES);

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Relying Parties</h2>

      <p className="mb-2">
        This page displays all FxA and SubPlat relying parties (RPs).
      </p>

      <p className="mb-6">
        Firefox accounts integrates with Mozilla groups on request via OAuth,
        OpenID, and webhooks, allowing them to offer users authentication and/or
        authorization with their Firefox account. These groups assume an RP
        role. See{' '}
        <LinkExternal
          href="https://mozilla.github.io/ecosystem-platform/relying-parties/tutorials/integration-with-fxa"
          className="underline"
        >
          this page
        </LinkExternal>{' '}
        for more info.
      </p>

      <hr />

      <Result {...{ loading, error, data }} />
    </>
  );
};

export default PageRelyingParties;
