/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { RelyingParty } from 'fxa-admin-server/src/graphql';
import ErrorAlert from '../ErrorAlert';
import { AdminPanelFeature } from '../../../../fxa-shared/guards';
import { Guard } from '../Guard';
import { getFormattedDate } from '../../lib/utils';
import { TableRowYHeader, TableYHeaders } from '../TableYHeaders';
import { GET_RELYING_PARTIES, UPDATE_NOTE } from './index.gql';

interface RelyingPartiesData {
  relyingParties: RelyingParty[];
}

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
      'bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded';
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
      return `text-red-700 visible`;
    }
    if (status) {
      return `text-gray-800 visible`;
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
    <>
      <textarea
        data-testid={`notes-${id}`}
        className="w-96 mb-2 border border-grey-100 block"
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
        <p
          className={`pl-3 inline-block ${statusClass()}`}
          data-testid={`notes-status-${id}`}
        >
          {statusText()}
        </p>
      </Guard>
    </>
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
      <section>
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
            <TableYHeaders key={id} header={name} className="table-y-headers">
              <TableRowYHeader header="ID" children={id} />
              <TableRowYHeader
                header="Created At"
                children={getFormattedDate(createdAt)}
              />
              <TableRowYHeader
                header="Redirect URI"
                children={
                  redirectUri ? (
                    redirectUri
                  ) : (
                    <span className="result-grey">(empty string)</span>
                  )
                }
              />
              <TableRowYHeader
                header="Allowed Scopes"
                children={<AllowedScopes {...{ allowedScopes }} />}
              />
              <TableRowYHeader header="Trusted" children={trusted.toString()} />
              <TableRowYHeader
                header="Can Grant"
                children={canGrant.toString()}
              />
              <TableRowYHeader
                header="Public Client"
                children={publicClient.toString()}
              />
              <TableRowYHeader
                header="Image URI"
                children={
                  imageUri ? (
                    imageUri
                  ) : (
                    <span className="result-grey">(empty string)</span>
                  )
                }
              />
              <TableRowYHeader
                header="Notes"
                children={<Notes {...{ id, notes: notes || '' }} />}
              />
            </TableYHeaders>
          )
        )}
      </section>
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
      <h2 className="header-page">Relying Parties</h2>

      <p className="mb-2">
        This page displays all FxA and SubPlat relying parties (RPs).
      </p>

      <p>
        Mozilla accounts integrates with Mozilla groups on request via OAuth,
        OpenID, and webhooks, allowing them to offer users authentication and/or
        authorization with their Mozilla account. These groups assume an RP
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
