import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import { useAwait, PromiseState } from './hooks';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = '//worldtimeapi.org/api/ip';

storiesOf('hooks|useAwait', module)
  .add('basic', () => (
    <>
      <UseAwaitExample />
      <UseAwaitExample apiUrl="//worldtimeapi.org/api/timezone/Europe/London" />
      <UseAwaitExample apiUrl="//worldtimeapi.org/api/timezone/America/Detroit" />
    </>
  ))
  .add('with initial state', () => (
    <UseAwaitExample
      initialState={{
        result: initialResult(),
        pending: false,
        error: undefined,
      }}
    />
  ))
  .add('with immediate execution', () => (
    <UseAwaitExample
      executeImmediately={true}
      fetchApiFn={() => fetchApi(API_URL)}
    />
  ))
  .add('with error', () => (
    <UseAwaitExample apiUrl="//worldtimeapi.org/badPage" />
  ));

const UseAwaitExample = ({
  fetchApiFn = fetchApi,
  apiUrl = API_URL,
  style = {},
  executeImmediately = undefined as boolean | undefined,
  initialState = undefined as PromiseState<ApiResult, any> | undefined,
}) => {
  const [apiState, apiExecute, apiReset] = useAwait(fetchApiFn, {
    executeImmediately,
    initialState,
  });
  const executeWithApiUrl = useCallback(() => apiExecute(apiUrl), [
    apiUrl,
    apiExecute,
  ]);

  const buttonClassNames = 'mr-1 py-1 px-2 bg-grey-100 border-grey-600';
  return (
    <div className="m-4 p-4">
      <button className={buttonClassNames} onClick={apiReset}>
        Reset
      </button>
      <button className={buttonClassNames} onClick={executeWithApiUrl}>
        Request
      </button>
      {apiUrl}
      <ApiStateDisplay {...apiState} />
    </div>
  );
};

const ApiStateDisplay = ({
  pending,
  error,
  result,
}: PromiseState<ApiResult, any>) => {
  if (!pending && !error && !result) {
    return <p>Reset state</p>;
  } else if (pending) {
    return <LoadingSpinner />;
  } else if (error) {
    return <p>Error: {error.message}</p>;
  } else if (result) {
    const { datetime, timezone, client_ip, abbreviation } = result;
    return (
      <div>
        <p>Hello, client from {client_ip}</p>
        <p>
          It is {datetime} in {timezone} ({abbreviation})
        </p>
      </div>
    );
  }
  return <p>Unknown state</p>;
};

// Partial type of worldtimeapi result
type ApiResult = {
  abbreviation: string;
  client_ip: string;
  datetime: string;
  timezone: string;
};

const fetchApi = async (urlToFetch: string): Promise<ApiResult> => {
  const resp = await fetch(urlToFetch);
  const data = await resp.json();
  return data;
};

const initialResult = (): ApiResult => ({
  abbreviation: 'BLA',
  client_ip: '1.2.3.4',
  datetime: 'blah blah blah',
  timezone: 'blah/blah',
});
