import React, { useState } from 'react';
import { withApollo } from 'react-apollo';
import { FEED_SEARCH_QUERY } from '../constants';
import Link from './Link';

const Search = ({ client }) => {
  const [searchInfo, setSearchInfo] = useState({
    links: [],
    filter: ''
  });
  const { links, filter } = searchInfo;

  const executeSearch = async () => {
    const result = await client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    });
    const links = result.data.feed.links;

    setSearchInfo({ ...searchInfo, links });
  }

  return (
    <div>
      <div>
        Search
        <input
          type="text"
          onChange={ e => setSearchInfo({ ...searchInfo, filter: e.target.value }) }
        />
        <button onClick={ executeSearch }>OK</button>
      </div>
      {
        links.map((link, index) =>
          <Link key={ link.id } link={ link } index={ index } />
        )
      }
    </div>
  )
}

export default withApollo(Search);
