import React from 'react';
import { Query } from 'react-apollo';
import { FEED_QUERY, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION, LINKS_PER_PAGE } from '../constants';
import Link from './Link';

const subscribeToNewLinks = subscribeToMore => {
  subscribeToMore({
    document: NEW_LINKS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;

      const newLink = subscriptionData.data.newLink;
      const exists = prev.feed.links.find(({ id }) => id === newLink.id);

      if (exists) return prev;

      return Object.assign({}, prev, {
        feed: {
          links: [newLink, ...prev.feed.links],
          count: prev.feed.links.length + 1,
          __typename: prev.feed.__typename
        }
      })
    }
  })
}

const subscribeToNewVotes = subscribeToMore => {
  subscribeToMore({
    document: NEW_VOTES_SUBSCRIPTION
  })
}


const LinkList = ({ history, location: { pathname }, match: { params: { page } } }) => {
  const isNewPage = pathname.includes('new');
  const currentPage = parseInt(page, 10);
  const skip = isNewPage ? (currentPage - 1) * LINKS_PER_PAGE : 0;
  const first = isNewPage ? LINKS_PER_PAGE : 100;
  const orderBy = isNewPage ? 'createdAt_DESC' : null;

  const updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });
    const votedLink = data.feed.links.find(link => link.id === linkId);

    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: FEED_QUERY, data });
  }

  const getQueryVariables = () => ({ first, skip, orderBy })

  const getLinksToRender = ({ feed: { links } }) => {
    if (isNewPage) return links;

    const rankedList = links.slice();
    rankedList.sort((link1, link2) => link2.votes.length - link1.votes.length);

    return rankedList;
  }

  const goToNextPage = ({ feed: { count } }) => {
    if (page <= count / LINKS_PER_PAGE) {
      const nextPage = currentPage + 1;
      history.push(`/new/${nextPage}`);
    }
  }

  const goToPreviousPage = () => {
    if (page > 1) {
      const previousPage = page - 1;
      history.push(`/new/${previousPage}`);
    }
  }

  return (
    <Query query={ FEED_QUERY } variables={ getQueryVariables() }>
      {
        ({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching...</div>
          if (error) return <div>Error!</div>

          subscribeToNewLinks(subscribeToMore);
          subscribeToNewVotes(subscribeToMore);

          const linksToRender = getLinksToRender(data);
          const pageIndex = page ? (page - 1) * LINKS_PER_PAGE : 0;

          return (
            <>
              {
                linksToRender.map((link, index) =>
                  <Link
                    key={ link.id }
                    link={ link }
                    index={ index + pageIndex }
                    updateStoreAfterVote={ updateCacheAfterVote }
                  />
                )
              }
              {
                isNewPage &&
                  <div className="flex ml4 mv3 gray">
                    <div className="pointer mr2" onClick={ goToPreviousPage }>Previous</div>
                    <div className="pointer" onClick={ () => goToNextPage(data) }>Next</div>
                  </div>
              }
            </>
          )
        }
      }
    </Query>
  )
}

export default LinkList;
