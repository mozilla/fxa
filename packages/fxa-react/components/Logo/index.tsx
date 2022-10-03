/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React from 'react';
 import logo from '../../images/ff-logo.svg';

 type LogoProps = {
   className?: string;
 };

 export const Logo = ({ className = '' }: LogoProps) => (
     <img
       src={logo}
       data-testid="logo"
       className={`h-10 w-10 ltr:mr-4 rtl:ml-4 ${className}`}
       alt="Firefox logo"
     />
 );

 export default Logo;
