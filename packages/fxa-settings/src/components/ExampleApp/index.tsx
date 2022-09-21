import React from 'react';
import { Router } from '@reach/router';
import PageExampleTestOne from '../PageExampleTestOne';
import PageExampleTestTwo from '../PageExampleTestTwo';

import { RouteComponentProps } from '@reach/router';
import ConnectAnotherDevice from '../PageConnectAnotherDevice';

export const ExampleApp = (props: RouteComponentProps ) => {
    return (
        <Router>
            <PageExampleTestOne path="/" />
            <PageExampleTestTwo path="/two" />
            <ConnectAnotherDevice path="/connect_another_device" />
        </Router>
    )
}
