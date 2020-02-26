import React from 'react';

import visaLogo from '../../../images/visa.svg';
import mastercardLogo from '../../../images/mastercard.svg';
import discoverLogo from '../../../images/discover.svg';
import amexLogo from '../../../images/amex.svg';

import './index.scss';

export const AcceptedCards = () => {
  return (
    <div className="accepted-cards">
      <img src={visaLogo} alt="visa" />
      <img src={mastercardLogo} alt="mastercard" />
      <img src={discoverLogo} alt="discover" />
      <img src={amexLogo} alt="american express" />
    </div>
  );
};

export default AcceptedCards;
