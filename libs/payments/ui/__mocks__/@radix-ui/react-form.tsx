/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const actual = jest.requireActual('@radix-ui/react-form');
const ActualRoot = actual.Root;

type RootProps = Omit<React.ComponentPropsWithoutRef<'form'>, 'action'> & {
  action?: ((formData: FormData) => void | Promise<void>) | string;
};

const Root = ({ action, onSubmit, ...rest }: RootProps) => (
  <ActualRoot
    {...rest}
    onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
      if (typeof action === 'function') {
        e.preventDefault();
        action(new FormData(e.currentTarget));
      }
      onSubmit?.(e);
    }}
  />
);

const mocked = { ...actual, Root, Form: Root };

export = mocked;
