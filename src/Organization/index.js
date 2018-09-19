import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import Loading from '../Loading';
import ErrorMessage from '../Error';

const GET_REPOSITORIES_OF_ORGANIZATION  = gql`
    query ($orgName: String!, $cursor:String) {
        organization(login: $orgName) {
            repositories(first: 5, after: $cursor) {
                edges {
                    node {
                        ...repository
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }

    ${REPOSITORY_FRAGMENT}
`
const Organization = ({orgName}) => 

(
    <Query 
        query={GET_REPOSITORIES_OF_ORGANIZATION} 
        variables={{orgName}} 
        skip={orgName===''}
        notifyOnNetworkStatusChange={true}>
           {({data,loading, error, fetchMore})=>{
              if (error) {
                    return <ErrorMessage error={error} />;
              }

            const { organization } = data;

                if (loading && !organization) {
                    return <Loading />;
                }

                return (
                    <RepositoryList
                    loading={loading}
                    repositories={organization.repositories}
                    fetchMore={fetchMore}
                    />
                );

        }}
    </Query>
)

export default Organization;