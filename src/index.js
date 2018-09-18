import React from 'react';
import ReactDOM from 'react-dom';

import {ApolloProvider} from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
 
import registerServiceWorker from './registerServiceWorker';
import App from './App';

import './style.css';


const GITHUB_BASE_URL = 'https://api.github.com/graphql';
const httpLink =  new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`
  }
})

const cache = new InMemoryCache();


const errorLink = onError(({graphQLErrors, networkError}) => {
  if (graphQLErrors) {
    console.log('graphql error')
  }

  if (networkError) {
    console.log('network error')
  }
})
const link = ApolloLink.from([errorLink, httpLink]);
const client = new ApolloClient({
  link,
  cache
});
ReactDOM.render(
  <ApolloProvider client={client}><App /></ApolloProvider>,
  document.getElementById('root')
);

registerServiceWorker();
