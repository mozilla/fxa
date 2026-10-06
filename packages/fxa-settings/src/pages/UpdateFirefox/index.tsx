/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocation } from 'react-router';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { MetricsFlow } from '../../lib/metrics-flow';
import { useViewEvent } from '../../lib/metrics';

// /download_firefox returns 400 for a param outside this list, or a value that
// fails its check (content-server redirect-download-firefox.js)
const ENTRYPOINT = /^[\w.:-]+$/;
const isUtm = (v: string) => v.length <= 128 && /^[\w/.%-]+$/.test(v);
const FORWARDED_PARAMS: Record<string, (value: string) => boolean> = {
  action: (v) => /^(email|signin|signup)$/.test(v),
  context: (v) => /^[0-9a-z_-]+$/.test(v),
  entrypoint: (v) => ENTRYPOINT.test(v),
  entrypoint_experiment: (v) => ENTRYPOINT.test(v),
  entrypoint_variation: (v) => ENTRYPOINT.test(v),
  service: (v) => /^[a-zA-Z0-9-]{1,16}$/.test(v),
  // The firstrun page sends this one value with plus signs
  utm_campaign: (v) =>
    isUtm(v) || v === 'page+referral+-+not+part+of+a+campaign',
  utm_content: isUtm,
  utm_medium: isUtm,
  utm_source: isUtm,
  utm_term: isUtm,
};

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
  Object.entries(FORWARDED_PARAMS).forEach(([name, isValid]) => {
    const value = currentParams.get(name);
    if (value !== null && value.length <= 1024 && isValid(value)) {
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
