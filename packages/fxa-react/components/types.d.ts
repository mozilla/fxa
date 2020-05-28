// This is a supplementary declaration so you can import SVGs in
// fxa-shared components using the format create-react-app provides.
// e.g. `import { ReactComponent as Logo } from './logo.svg';`
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}
