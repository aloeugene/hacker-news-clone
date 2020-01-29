import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import { POST_MUTATION, FEED_QUERY, LINKS_PER_PAGE } from '../constants';

const CreateLink = ({ history }) => {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          type="text"
          placeholder="A description for the link"
          value={ description }
          onChange={ e => setDescription(e.target.value) }
        />
        <input
          className="mb2"
          type="text"
          placeholder="A URL for the link"
          value={ url }
          onChange={ e => setUrl(e.target.value) }
        />
      </div>
      <Mutation
        mutation={ POST_MUTATION }
        variables={{ description, url }}
        onCompleted={ () => history.push('/new/1') }
        update={
          (store, { data: { post } }) => {
            const first = LINKS_PER_PAGE;
            const skip = 0;
            const orderBy = 'createdAt_DESC';
            const data = store.readQuery({
              query: FEED_QUERY,
              variables: { first, skip, orderBy }
            });

            data.feed.links.unshift(post);

            store.writeQuery({
              query: FEED_QUERY,
              data,
              variables: { first, skip, orderBy }
            });
          }
        }
      >
        {
          postMutation => <button onClick={ postMutation }>Submit</button>
        }
      </Mutation>
    </div>
  )
}

export default CreateLink;
