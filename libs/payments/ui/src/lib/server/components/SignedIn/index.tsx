/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import checkmarkIcon from '@fxa/shared/assets/images/checkmark.svg';

interface SignedInProps {
  email: string;
}

export const SignedIn = ({ email }: SignedInProps) => {
  return (
    <div className="flex items-center justify-between bg-grey-100 break-all fixed font-medium gap-4 text-black px-4 py-2 w-full z-40 tablet:px-2 tablet:py-4 tablet:relative tablet:rounded tablet:w-auto tablet:z-0">
      <div className="h-5 overflow-auto">{email}</div>
      <Image src={checkmarkIcon} alt="" />
    </div>
  );
};
