/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`flex items-center justify-center bg-blue-500 font-semibold h-12 rounded-md text-white w-full p-4 mt-6 hover:bg-blue-700 aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none ${props.className}`}
    >
      {children}
    </button>
  );
}
