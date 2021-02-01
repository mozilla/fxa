import { ApolloClient, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ErrorHandler, onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { cache, sessionToken, typeDefs } from './cache';

export const errorHandler: ErrorHandler = ({ graphQLErrors, networkError }) => {
  let reauth = false;
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.message === 'Invalid token') {
        reauth = true;
      }
    }
  }
  if (networkError && 'statusCode' in networkError) {
    if (networkError.statusCode === 401) {
      reauth = true;
    }
  }
  if (reauth) {
    window.location.replace(
      `/get_flow?redirect_to=${encodeURIComponent(window.location.pathname)}`
    );
  } else {
    console.error('graphql errors', graphQLErrors, networkError);
  }
};

export function createApolloClient(gqlServerUri: string) {
  // authLink sets the Authentication header on outgoing requests
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: 'Bearer ' + sessionToken(),
      },
    };
  });

  // errorLink handles error responses from the server
  const errorLink = onError(errorHandler);

  // uploadLink makes the actual requests to the server(httpLink with uploads)
  const uploadLink = createUploadLink({ uri: `${gqlServerUri}/graphql` });

  const apolloClient = new ApolloClient({
    cache,
    // uploadLink needs to be imported with `as any` because 'apollo-upload-client'
    // dependency is out of sync with Apollo Client, once 'apollo-upload-client'
    // updates itself, we should be able to remove the `as any` here.
    link: from([errorLink, authLink, uploadLink as any]),
    typeDefs,
  });

  return apolloClient;
}
