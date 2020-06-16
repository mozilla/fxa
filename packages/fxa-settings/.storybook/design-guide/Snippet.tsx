import React from 'react';

const Snippet = ({ moarClasses = '', children }) => (
  <code className={`bg-grey-100 text-sm px-1 rounded-sm ${moarClasses}`}>
    {children}
  </code>
);

export default Snippet;
