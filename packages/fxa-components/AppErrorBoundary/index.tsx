/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import AppErrorDialog from "../AppErrorDialog";

class AppErrorBoundary extends React.Component {
  state: {
    error: undefined | Error;
  };

  constructor(props: {}) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("AppError", error);

    // TODO: Add Sentry logging
    // sentryMetrics.captureException(error);
  }

  render() {
    const { error } = this.state;
    return error ? <AppErrorDialog {...{ error }} /> : this.props.children;
  }
}

export default AppErrorBoundary;
