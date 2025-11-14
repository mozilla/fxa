/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import {
  RelyingPartyDto,
  RelyingPartyUpdateDto,
} from 'fxa-admin-server/src/graphql';
import ErrorAlert from '../ErrorAlert';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { Guard } from '../Guard';
import { getFormattedDate } from '../../lib/utils';
import { TableRowYHeader, TableYHeaders } from '../TableYHeaders';
import {
  CREATE_RELYING_PARTY,
  GET_RELYING_PARTIES,
  UPDATE_RELYING_PARTY,
  DELETE_RELYING_PARTY,
} from './index.gql';

interface RelyingPartiesData {
  relyingParties: RelyingPartyDto[];
}

/** Parses and formats a relying party's list of scopes. */
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

/** Form that allows editing or creating a relying party. */
const RelyingPartyForm = ({
  handleSubmit,
  resetState,
  onExit,
  data,
  status,
}: {
  handleSubmit: (data: RelyingPartyUpdateDto) => void;
  resetState: () => void;
  onExit: () => void;
  data?: RelyingPartyDto;
  status?: string;
}) => {
  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const state = {
      name: formData.get('name')?.toString() || '',
      imageUri: formData.get('imageUri')?.toString() || '',
      redirectUri: formData.get('redirectUri')?.toString() || '',
      canGrant: formData.get('canGrant') === 'true',
      publicClient: formData.get('publicClient') === 'true',
      trusted: formData.get('trusted') === 'true',
      allowedScopes: formData.get('allowedScopes')?.toString() || '',
      notes: formData.get('notes')?.toString() || '',
    };
    handleSubmit(state);
  };

  return (
    <>
      <form onSubmit={onSubmit} onChange={resetState} className="mt-5 relative">
        <label>Name:</label>
        <input
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="name"
          type="text"
          name="name"
          defaultValue={data?.name || ''}
        ></input>

        <label>Image URL:</label>
        <input
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="http://mozilla.com/rp/logo.png"
          type="text"
          name="imageUri"
          defaultValue={data?.imageUri || ''}
        ></input>

        <label>Redirect URL:</label>
        <input
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="http://mozilla.com/rp/login"
          type="text"
          name="redirectUri"
          defaultValue={data?.redirectUri || ''}
        ></input>

        <label>Can Grant:</label>
        <select
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          name="canGrant"
          defaultValue={data?.canGrant?.toString() || 'true'}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>Public Client: </label>
        <select
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          name="publicClient"
          defaultValue={data?.publicClient?.toString() || 'true'}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>Trusted: </label>
        <select
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          name="trusted"
          defaultValue={data?.trusted?.toString() || 'true'}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>Allowed Scopes:</label>
        <input
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="profile"
          type="text"
          name="allowedScopes"
          defaultValue={data?.allowedScopes || ''}
        ></input>

        <label>Notes:</label>
        <textarea
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="Enter notes about RP."
          name="notes"
          defaultValue={data?.notes || ''}
        ></textarea>

        <button
          className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded m-1"
          type="submit"
          data-testid="rp-update"
          hidden={status === 'pending'}
        >
          Submit
        </button>
        <button
          className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded m-1"
          hidden={status === 'pending'}
          onClick={() => {
            onExit();
          }}
        >
          Cancel
        </button>
      </form>
      {status && <p className="mt-2">{status}</p>}
    </>
  );
};

/** UI for creating a new relying party. */
const CreateRelyingParty = ({ onExit }: { onExit: () => void }) => {
  const [status, setStatus] = useState<string>('');

  const resetState = () => {
    setStatus('');
  };

  const [createRelyingParty] = useMutation<{ createRelyingParty: string }>(
    CREATE_RELYING_PARTY,
    {
      onCompleted: (data) => {
        if (data.createRelyingParty) {
          setStatus('Success!');
          setTimeout(onExit, 500);
        } else {
          setStatus(`Could not create relying party! Try again.`);
        }
      },
      onError: (err) => {
        setStatus(`Error Encountered: ${err.message}`);
      },
    }
  );

  const handleSubmit = async (data: RelyingPartyUpdateDto) => {
    setStatus('Pending');
    const payload = {
      variables: {
        relyingParty: data,
      },
    };
    await createRelyingParty(payload);
  };

  return (
    <div>
      <RelyingPartyForm
        {...{
          onExit,
          handleSubmit,
          resetState,
          status,
        }}
      />
    </div>
  );
};

/** UI for updating a relying party. */
const UpdateRelyingParty = ({
  data,
  onExit,
}: {
  data: RelyingPartyDto;
  onExit: () => void;
}) => {
  const [status, setStatus] = useState<string>('');

  const resetState = () => {
    setStatus('');
  };

  const [updateRelyingParty] = useMutation<{ updateRelyingParty: boolean }>(
    UPDATE_RELYING_PARTY,
    {
      onCompleted: (data) => {
        if (data.updateRelyingParty === true) {
          setStatus('Success!');
          setTimeout(onExit, 500);
        } else {
          setStatus(`Could not update relying party! Try again.`);
        }
      },
      onError: (err) => {
        setStatus(`Error Encountered: ${err.message}`);
      },
    }
  );

  const handleSubmit = (formData: RelyingPartyUpdateDto) => {
    setStatus('pending');
    const payload = {
      variables: {
        id: data.id,
        relyingParty: formData,
      },
    };
    updateRelyingParty(payload);
  };

  return (
    <div>
      <h3 className="header-lg font-bold">
        Editing Relying Party: {data?.name} <i>(id:{data?.id})</i>
      </h3>
      <RelyingPartyForm
        {...{
          onExit,
          handleSubmit,
          resetState,
          data,
          status,
        }}
      />
    </div>
  );
};

/** UI for deleting an existing relying party. */
const DeleteRelyingParty = ({
  data,
  onExit,
}: {
  data: RelyingPartyDto;
  onExit: () => void;
}) => {
  const [status, setStatus] = useState('');

  const [deleteRelyingParty] = useMutation<{ deleteRelyingParty: boolean }>(
    DELETE_RELYING_PARTY,
    {
      onCompleted: (data) => {
        if (data.deleteRelyingParty === true) {
          setStatus('Success!');
          setTimeout(onExit, 500);
        } else {
          setStatus('Could not delete RP. Try again!');
        }
      },
      onError: (err) => {
        setStatus(`Error Encountered Deleting RP: ${err.message}`);
      },
    }
  );

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('confirmName')?.toString()?.trim();
    if (name === data.name) {
      await deleteRelyingParty({
        variables: {
          id: data.id,
        },
      });
    } else {
      setStatus(`You must confirm the relying party's name!`);
    }
  };

  return (
    <>
      <h3 className="header-lg font-bold">
        Deleting Relying Party: {data.name}
      </h3>
      <form onSubmit={handleSubmit}>
        <label>
          Are you sure you want to proceed? This cannot be undone! To continue
          type name below:
        </label>
        <input
          className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
          placeholder="Enter Relying Party Name"
          type="text"
          name="confirmName"
        ></input>
        <button
          type="submit"
          className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded m-1"
          data-testid="rp-delete"
        >
          Submit
        </button>

        <button
          className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded m-1"
          onClick={onExit}
        >
          Cancel
        </button>
      </form>
      {status && <p className="mt-2">{status}</p>}
    </>
  );
};

/** UI for viewing relying party's current state. */
const RelyingPartyRow = ({
  data,
  onExit,
}: {
  data: RelyingPartyDto;
  onDelete: (id: string) => Promise<void>;
  onExit: () => void;
}) => {
  const [mode, setMode] = useState<'view' | 'update' | 'delete'>('view');

  const {
    id,
    name,
    createdAt,
    redirectUri,
    allowedScopes,
    trusted,
    canGrant,
    publicClient,
    notes,
    imageUri,
  } = data;

  if (mode === 'view') {
    return (
      <div className="mt-12 mb-12">
        <h3 className="header-lg float-left">{name}</h3>
        <button
          className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded float-right m-1 mt-5"
          onClick={() => {
            setMode('delete');
          }}
        >
          🗑️ Delete
        </button>
        <button
          className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded float-right m-1 mt-5"
          onClick={() => setMode('update')}
        >
          🖊️ Edit
        </button>

        <TableYHeaders key={id} className="table-y-headers w-full">
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
          <TableRowYHeader header="Can Grant" children={canGrant.toString()} />
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
          <TableRowYHeader header="Notes" children={<span>{notes}</span>} />
        </TableYHeaders>
        <hr />
      </div>
    );
  } else if (mode === 'update') {
    return (
      <UpdateRelyingParty
        {...{
          mode: 'update',
          data,
          onExit: () => {
            setMode('view');
            onExit();
          },
        }}
      />
    );
  } else if (mode === 'delete') {
    return (
      <DeleteRelyingParty
        {...{
          data,
          onExit: () => {
            setMode('view');
            onExit();
          },
        }}
      />
    );
  }
  return <>?</>;
};

/** Page displaying all relying parties and allows for basic CRUD type operations. */
export const PageRelyingParties = () => {
  const [showAddRp, setShowAddRp] = useState(false);

  const { loading, error, data, refetch } = useQuery<RelyingPartiesData>(
    GET_RELYING_PARTIES,
    {
      fetchPolicy: 'network-only',
    }
  );
  const [deleteRelyingParty] = useMutation<boolean>(DELETE_RELYING_PARTY);

  const handleDelete = async (id: string) => {
    try {
      await deleteRelyingParty({
        variables: {
          id: id,
        },
      });
    } catch (error) {}
  };

  // Let's us find a specific RP quickly.
  const [filter, setFilter] = useState('');
  const filterRelyingParties = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rpFilter = formData.get('rpFilter');
    try {
      if (typeof rpFilter === 'string') {
        setFilter(rpFilter || '');
      }
    } catch {}
  };

  const getFilteredRps = () => {
    if (!error && !loading && data) {
      if (!filter.trim()) {
        return data.relyingParties;
      }

      return data.relyingParties.filter(
        (x) => x.name.indexOf(filter) >= 0 || x.id.indexOf(filter) >= 0
      );
    }

    return [];
  };

  return (
    <>
      <h2 className="header-page">Relying Parties</h2>

      <p className="mb-2">
        This page displays all FxA and SubPlat relying parties (RPs). With
        adequate permissions you may also be able to edit the RPs properties,
        delete RPs, and/or create new RPs.
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

      {showAddRp && (
        <>
          <Guard features={[AdminPanelFeature.CreateRelyingParty]}>
            <h3 className="header-page font-bold">Add New RP</h3>
            <p>Fill out the form below to add a new Relying Party.</p>
            <CreateRelyingParty
              {...{
                onExit: () => {
                  refetch();
                  setShowAddRp(false);
                },
              }}
            />
          </Guard>
        </>
      )}

      {!showAddRp && (
        <>
          <Guard features={[AdminPanelFeature.CreateRelyingParty]}>
            <h3 className="header-page font-bold">Add New RP</h3>
            <p>Create an configure an new relying party.</p>
            <button
              className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded mt-4"
              onClick={() => {
                setShowAddRp(true);
              }}
            >
              Create!
            </button>
          </Guard>
          <hr />

          <form onSubmit={filterRelyingParties} className="mt-5 relative">
            <input
              type="text"
              name="rpFilter"
              placeholder="Filter by relying party name or ID."
              className="bg-grey-50 rounded-l w-full py-2 px-3 placeholder-grey-500 mb-4 mt-1"
              defaultValue={filter}
            ></input>
            <button
              type="submit"
              data-testid="rp-filter"
              className="bg-grey-10 border-2 p-1 border-grey-100 font-small leading-6 rounded"
            >
              Filter
            </button>
          </form>

          {loading && <p className="mt-2">Loading...</p>}
          {!loading && error && <ErrorAlert {...{ error }}></ErrorAlert>}
          {getFilteredRps().length > 0 && (
            <section>
              {getFilteredRps().map((data) => (
                <RelyingPartyRow
                  data={data}
                  onExit={() => {
                    refetch();
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </section>
          )}
          {!loading && !error && !(data && data.relyingParties.length > 0) && (
            <p>
              No relying parties were found. Check double check your filter.{' '}
              <i>
                Or if you're seeing this locally, try creating an account to
                seed the database.
              </i>
            </p>
          )}
        </>
      )}
    </>
  );
};

export default PageRelyingParties;
