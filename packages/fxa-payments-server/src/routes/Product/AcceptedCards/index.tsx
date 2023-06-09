import React from 'react';

import { Localized } from '@fluent/react';
import visaLogo from '../../../images/visa.svg';
import mastercardLogo from '../../../images/mastercard.svg';
import discoverLogo from '../../../images/discover.svg';
import amexLogo from '../../../images/amex.svg';

export const AcceptedCards = () => {
  return (
    <>
      <Localized id="pay-with-heading-card-only">
        <p className="pay-with-heading">Pay with card</p>
      </Localized>
      <div className="flex justify-center mt-9 mb-14 gap-2">
        <img src={visaLogo} alt="Visa" />
        <img src={mastercardLogo} alt="Mastercard" />
        <img src={discoverLogo} alt="Discover" />
        <img src={amexLogo} alt="American Express" />
      </div>
    </>
  );
};

export default AcceptedCards;
