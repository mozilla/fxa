/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum ButtonVariant {
  Primary,
  Secondary,
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
}

export function BaseButton({ children, variant, ...props }: ButtonProps) {
  let variantStyles = '';
  switch (variant) {
    case ButtonVariant.Primary:
      variantStyles = 'bg-blue-500 hover:bg-blue-700 text-white';
      break;
    case ButtonVariant.Secondary:
      variantStyles = 'bg-grey-100 hover:bg-grey-200 text-black';
      break;
  }

  return (
    <button
      {...props}
      className={`flex items-center justify-center font-semibold h-12 rounded-md p-4 z-10 aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none ${props.className} ${variantStyles}`}
    >
      {children}
    </button>
  );
}
