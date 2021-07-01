import React, { useEffect, useState } from 'react';

export interface RenderedEmailProps {
  template: string;
  variables: Record<string, any>;
}

export const RenderedEmail: React.FC<RenderedEmailProps> = ({
  template,
  variables,
}) => {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  useEffect(() => {
    renderUsingMJML({ template, variables }).then((result) =>
      setRenderedHtml(result)
    );
  }, [template, variables, setRenderedHtml]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderedHtml,
      }}
    />
  );
};

async function renderUsingMJML({
  template,
  apiUrl = 'http://localhost:8192',
  variables,
}: {
  template: string;
  apiUrl?: string;
  variables: Record<string, any>;
}): Promise<string> {
  const resp = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({
      template,
      ...variables,
    }),
  });
  return await resp.text();
}

export default RenderedEmail;
