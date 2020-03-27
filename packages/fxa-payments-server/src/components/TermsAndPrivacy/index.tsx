import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import { AppContext } from '../../lib/AppContext';

import './index.scss';

export const TermsAndPrivacy = () => {
  const { config } = useContext(AppContext);

  return (
    <div>
      <div className="terms">
        <Localized id="terms">
          <a
            rel="noopener noreferrer"
            target="_blank"
            data-testid="terms"
            href={config.legalDocLinks.termsOfService}
          >
            Terms of Service
          </a>
        </Localized>
      </div>
      <div className="privacy">
        <Localized id="privacy">
          <a
            rel="noopener noreferrer"
            target="_blank"
            data-testid="privacy"
            href={config.legalDocLinks.privacyNotice}
          >
            Privacy Notice
          </a>
        </Localized>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;
