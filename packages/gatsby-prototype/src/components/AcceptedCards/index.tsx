import React from 'react';

import amexLogo from '../../images/amex.svg';
import discoverLogo from '../../images/discover.svg';
import mastercardLogo from '../../images/mastercard.svg';
import visaLogo from '../../images/visa.svg';

const AcceptedCards = () => (
  <div className="flex justify-center mb-4 gap-2">
    <img src={visaLogo} alt="visa" />
    <img src={mastercardLogo} alt="mastercard" />
    <img src={discoverLogo} alt="discover" />
    <img src={amexLogo} alt="american express" />
  </div>
);

export default AcceptedCards;
