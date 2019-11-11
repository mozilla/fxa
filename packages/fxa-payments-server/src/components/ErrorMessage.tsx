import React, { ReactNode } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import './ErrorMessage.scss';

type ErrorMessageProps = {
  children: ReactNode;
  isVisible?: boolean;
};

export const ErrorMessage = ({ children, isVisible }: ErrorMessageProps) => (
  <TransitionGroup component={null}>
    {isVisible && (
      <CSSTransition classNames="animate-fade" timeout={150}>
        <div
          data-testid="error-message-container"
          className={'error-message-container'}
        >
          {children}
        </div>
      </CSSTransition>
    )}
  </TransitionGroup>
);

export default ErrorMessage;
