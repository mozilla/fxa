/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { ApolloError, gql, useMutation, useQuery } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { RelyingParty } from 'fxa-admin-server/src/graphql';
import { DATE_FORMAT } from '../AccountSearch/Account';
import dateFormat from 'dateformat';
import ErrorAlert from '../ErrorAlert';
import { AdminPanelFeature } from '../../../../fxa-shared/guards';
import { Guard } from '../Guard';

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
    notes
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

export const UPDATE_NOTE = gql`
  mutation updateNotes($id: String!, $notes: String!) {
    updateNotes(id: $id, notes: $notes)
  }
`;

const Notes = ({ id, notes }: { id: string; notes: string }) => {
  const [saveAllowed, setSaveAllowed] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>(notes);

  const resetState = () => {
    setSaveAllowed(true);
    setStatus('');
    setError('');
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value === notes) {
      return;
    }
    resetState();
    setNewNotes(event.target.value);
  };

  const handleSaveNotes = () => {
    setSaveAllowed(false);
    setStatus('Updating...');
    updateNote({
      variables: {
        id,
        notes: newNotes,
      },
    });
  };

  const [updateNote] = useMutation(UPDATE_NOTE, {
    onCompleted: (data) => {
      setStatus('Success!');
      setTimeout(resetState, 1000);
    },

    onError: (err) => {
      let error = 'Error: Unexpected Error.';
      if (/ER_DATA_TOO_LONG/.test(err.message)) {
        error = 'Error: Changes not saved. Notes too long!';
      }
      setError(error);
    },
  });

  const saveButtonClass = () => {
    const base =
      'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 ml-2 rounded  mt';
    const active =
      'text-red-700 hover:text-red-700 hover:border-2 hover:border-grey-10 hover:bg-grey-50';
    const inactive = 'text-grey-700 cursor-not-allowed';
    return `${base} ${saveAllowed ? active : inactive}`;
  };
  const saveButtonDisabled = () => {
    return !saveAllowed || error !== '';
  };
  const statusClass = () => {
    if (error) {
      return `p-2  text-red-700 visible`;
    }
    if (status) {
      return `p-2 text-gray-800 visible`;
    }
    return `collapsed`;
  };

  const statusText = () => {
    if (error) {
      return error;
    }
    return status;
  };

  return (
    <div className="notes ">
      <textarea
        data-testid={`notes-${id}`}
        className="w-full mt-4 mb-2 border border-grey-100"
        onChange={handleNotesChange}
        defaultValue={notes}
      />
      <Guard features={[AdminPanelFeature.RelyingPartiesEditNotes]}>
        <button
          data-testid={`notes-save-btn-${id}`}
          className={saveButtonClass()}
          disabled={saveButtonDisabled()}
          onClick={handleSaveNotes}
        >
          Save
        </button>
        <div className={statusClass()} data-testid={`notes-status-${id}`}>
          {statusText()}
        </div>
      </Guard>
    </div>
  );
};

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
    return <ErrorAlert {...{ error }}></ErrorAlert>;
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
            notes,
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
                  <tr>
                    <th>Notes</th>
                    <td>
                      <Notes {...{ id, notes: notes || '' }} />
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
