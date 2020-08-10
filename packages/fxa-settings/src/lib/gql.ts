import { ApolloClient, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { cache, sessionToken, typeDefs } from './cache';

export function createApolloClient(gqlServerUri: string) {
  // httpLink makes the actual requests to the server
  const httpLink = createHttpLink({
    uri: `${gqlServerUri}/graphql`,
  });

  // authLink sets the Authentication header on outgoing requests
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: sessionToken(),
      },
    };
  });

  // errorLink handles error responses from the server
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    let reauth = false;
    if (graphQLErrors) {
      for (const error of graphQLErrors) {
        if (error.extensions?.code === 'UNAUTHENTICATED') {
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
      console.error(graphQLErrors, networkError);
    }
  });
  const apolloClient = new ApolloClient({
    cache,
    link: from([errorLink, authLink, httpLink]),
    typeDefs,
  });

  return apolloClient;
}
