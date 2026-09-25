/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocation } from 'react-router';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { MetricsFlow } from '../../lib/metrics-flow';
import { useViewEvent } from '../../lib/metrics';

// /download_firefox rejects any query param outside this list
const FORWARDED_PARAMS = [
  'action',
  'context',
  'entrypoint',
  'entrypoint_experiment',
  'entrypoint_variation',
  'service',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
];

// Where /download_firefox redirects after it logs the click
const FIREFOX_DOWNLOAD_URL = 'https://www.mozilla.org/firefox/download/thanks/';

const UpdateFirefox = ({
  metricsFlow,
}: {
  metricsFlow: MetricsFlow | null;
}) => {
  // get-update-firefox.js logs these events only when the server renders this page
  useViewEvent('flow', 'begin');
  useViewEvent('flow.update-firefox', 'view');
  const location = useLocation();
  // Keep a raw `+`, as the content-server client parser (lib/url.js) does
  const currentParams = new URLSearchParams(
    location.search.replace(/\+/g, '%2B')
  );
  const params = new URLSearchParams();
  FORWARDED_PARAMS.forEach((name) => {
    const value = currentParams.get(name);
    if (value !== null) {
      params.set(name, value);
    }
  });
  // /download_firefox returns 400 without these, so link to the download directly
  let downloadUrl = FIREFOX_DOWNLOAD_URL;
  if (metricsFlow?.deviceId && params.has('context')) {
    params.set('deviceId', metricsFlow.deviceId);
    params.set('flowBeginTime', String(metricsFlow.flowBeginTime));
    params.set('flowId', metricsFlow.flowId);
    downloadUrl = `/download_firefox?${params}`;
  }

  return (
    <AppLayout>
      <CardHeader
        headingTextFtlId="update-firefox-heading"
        headingText="Firefox update required"
      />

      <FtlMsg id="update-firefox-description">
        <p className="mt-2 text-sm">
          Your Mozilla account makes use of features that are not supported in
          your version of Firefox. Please download and install the latest
          version of Firefox to continue.
        </p>
      </FtlMsg>

      <div className="flex mt-6">
        <FtlMsg id="update-firefox-download-button">
          <a className="cta-primary cta-xl" href={downloadUrl}>
            Download latest
          </a>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default UpdateFirefox;
