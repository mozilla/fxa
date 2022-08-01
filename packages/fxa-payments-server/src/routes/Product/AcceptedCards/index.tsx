import React from 'react';

import visaLogo from '../../../images/visa.svg';
import mastercardLogo from '../../../images/mastercard.svg';
import discoverLogo from '../../../images/discover.svg';
import amexLogo from '../../../images/amex.svg';

export const AcceptedCards = () => {
  return (
    <div className="flex justify-center mb-10">
      <img className="py-1 pl-0 pr-1" src={visaLogo} alt="visa" />
      <img className="p-1" src={mastercardLogo} alt="mastercard" />
      <img className="p-1" src={discoverLogo} alt="discover" />
      <img className="p-1" src={amexLogo} alt="american express" />
    </div>
  );
};

export default AcceptedCards;
