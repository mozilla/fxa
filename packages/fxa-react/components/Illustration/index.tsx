/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React from 'react';
 import Hearts from '../../images/account-verified-hearts.svg';



 type IllustrationProps = {
   className?: string;
   altText: string;
   testId: string;
 };

 export const Illustration = ({ className = '', altText = '', testId = '' }: IllustrationProps) => {
  // we can save a bunch of illustrations in a dictionary of illustrations or something, and grab the right one via the testId
  const illustration = Hearts;
  return (
     <img
       src={illustration}
       data-testid={`illustration-${testId}`}
       className={className}
       alt={altText}
     />
 )};

 export default Illustration;
