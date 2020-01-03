import React, { useEffect, useContext } from 'react';
import { Localized } from 'fluent-react';
import { Plan } from '../../../store/types';
import { AppContext } from '../../../lib/AppContext';

import { metadataFromPlan } from '../../../store/utils';
import './index.scss';

const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionRedirectProps = {
  plan: Plan;
};

export const SubscriptionRedirect = ({ plan }: SubscriptionRedirectProps) => {
  const { product_id } = plan;
  const { downloadURL } = metadataFromPlan(plan);
  const {
    config: {
      env,
      productRedirectURLs,
      servers: {
        surveyGizmo: { url: surveyGizmoUrl },
      },
    },
    navigateToUrl,
  } = useContext(AppContext);

  const surveyEmbedUrl = `${surveyGizmoUrl}/s3/5294819/VPN-Subscription?__no_style=true&env=${env}`;

  const redirectUrl =
    downloadURL || productRedirectURLs[product_id] || defaultProductRedirectURL;

  useEffect(() => {
    const handleIframeTask = (e: MessageEvent) => {
      // Note: This event is implemented in code within the SurveyGizmo iframe embed.
      // https://help.surveygizmo.com/help/adding-javascript-to-your-survey
      if (e.data === 'submitted survey') {
        // TODO: Why the 250ms delay here?
        setTimeout(() => {
          navigateToUrl(redirectUrl);
        }, 250);
      }
    };
    window.addEventListener('message', handleIframeTask);
    return () => window.removeEventListener('message', handleIframeTask);
  }, [navigateToUrl, redirectUrl]);

  return (
    <div className="product-payment" data-testid="subscription-redirect">
      <div className="subscription-ready">
        <div className="subscription-message">
          <Localized id="sub-redirect-ready">
            <h2>Your subscription is ready</h2>
          </Localized>
          <Localized id="sub-redirect-copy">
            <div className="exp-message">
              Please take a moment to tell us about your experience.
            </div>
          </Localized>
        </div>
        <hr />
        <div className="survey-frame">
          <iframe
            data-testid="survey-iframe"
            title="survey"
            sandbox="allow-scripts allow-forms"
            scrolling="no"
            src={surveyEmbedUrl}
          ></iframe>
        </div>
        <div>
          <a
            href={redirectUrl}
            className="download-link"
            data-testid="download-link"
          >
            <Localized id="sub-redirect-skip-survey">
              No thanks, just take me to my product.
            </Localized>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRedirect;
