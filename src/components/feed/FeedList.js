import React from 'react';
import FeedItem from './FeedItem';

export default function FeedList({ feeds, onDeleted, onUpdated }) {
  return (
    <>
      {feeds.map(f => (
        <FeedItem
          key={f.FEEDNO}
          feed={f}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </>
  );
}
