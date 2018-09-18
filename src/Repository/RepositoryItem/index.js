import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import Link from '../../Link';
import Button from '../../Button';
import { REPOSITORY_FRAGMENT } from '../';

import '../style.css';

const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: {starrableId: $id}){
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`
const UNSTAR_REPOSITORY = gql`
  mutation($id: ID!) {
    removeStar(input : {starrableId: $id}) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const WATCH_REPO = gql`
  mutation($id: ID!, $state: SubscriptionState!) {
    updateSubscription(input: {subscribableId: $id, state: $state  }){
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const updateAddStar = (client, { data: { addStar: { starrable: { id } } } }) =>{

   const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  const totalCount = repository.stargazers.totalCount + 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount,
      },
    },
  });

}

const updateRemoveStar = (client, {data: {removeStar: {starrable: {id}}}}) => {
  const repository = client.readFragment({
    id:`Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });

  const totalCount = repository.stargazers.totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount,
      },
    },
  });
}

const updateWatchRepo = (client, {data:{updateSubscription: {subscribable: {id, viewerSubscription}}} }) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });
  const {totalCount} = repository.watchers;
  const watchersCount = viewerSubscription === 'SUBSCRIBED' ? totalCount + 1: totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount: watchersCount
      }
    }
  })

}
const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => (
  <div>
    <div className="RepositoryItem-title">
      <h2>
        <Link href={url}>{name}</Link>
      </h2>

      <div>
        { !viewerHasStarred ? (

        <Mutation mutation={STAR_REPOSITORY} variables={{id}} update={updateAddStar}>
        {(addStar, {data, loading, error}) => (

        <Button className={'RepositoryItem-title-action'} onClick={addStar}>{stargazers.totalCount} Stars</Button>
        )}
        </Mutation>
        ): (
          <span>{(<Mutation mutation={UNSTAR_REPOSITORY} variables={{id}} update={updateRemoveStar}>
            {(removeStar, {data, loading, error}) => (
            <Button className='RepositoryItem-title-action' onClick={removeStar}>
              UnStar
            </Button>
            )}</Mutation>)}</span>
        )

        }
            <Mutation 
                mutation={WATCH_REPO} 
                variables={{id, state: viewerSubscription==='SUBSCRIBED' ? 'UNSUBSCRIBED': 'SUBSCRIBED'}}
                update = {updateWatchRepo}
                >
              {(updateSubscription, {data, loading, error})  => {
                
                return <Button onClick={updateSubscription}>{watchers.totalCount} {viewerSubscription==='SUBSCRIBED' ? 'UnWatch' : 'Watch'}</Button>
              }
               
              }
            </Mutation>
           
        
      </div>
    </div>

    <div className="RepositoryItem-description">
      <div
        className="RepositoryItem-description-info"
        dangerouslySetInnerHTML={{ __html: descriptionHTML }}
      />
      <div className="RepositoryItem-description-details">
        <div>
          {primaryLanguage && (
            <span>Language: {primaryLanguage.name}</span>
          )}
        </div>
        <div>
          {owner && (
            <span>
              Owner: <a href={owner.url}>{owner.login}</a>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default RepositoryItem;