import React from 'react';
import { Meta } from '@storybook/react';
import { AlertBar, AlertBarProps } from './index';
import MockApp from '../../../.storybook/components/MockApp';
import { SettingsLayout } from '../AppLayout';

export default {
  title: 'components/AlertBar',
  component: AlertBar,
} as Meta;

const storyWithProps = ({
  actionButton,
  checked,
  children,
  className,
  dataTestId,
  elems,
  headerId,
  localizedId,
  onClick,
}: AlertBarProps) => {
  const story = () => (
    <MockApp>
      <SettingsLayout>
        <AlertBar
          actionButton={actionButton}
          checked={checked}
          className={className}
          dataTestId={dataTestId}
          elems={elems}
          headerId={headerId}
          localizedId={localizedId}
          onClick={onClick}
        >
          {children}
        </AlertBar>
        <p style={{ padding: '0 2em 4em 2em' }}>App content goes here</p>
      </SettingsLayout>
    </MockApp>
  );
  return story;
};

export const ErrorAlert = storyWithProps({
  children: 'Invalid payment information; there is an error with your account.',
  className: 'alert-error',
  dataTestId: 'error-alert',
  elems: true,
  headerId: 'error-alert-bar-header',
  localizedId: 'alert-bar-error',
});

export const ErrorAlertAction = storyWithProps({
  actionButton: () => {},
  children:
    'Invalid payment information; there is an error with your account. This alert may take some time to clear after you successfully update your information. {actionButton}',
  className: 'alert-error',
  dataTestId: 'invalid-payment-error-pending',
  elems: true,
  headerId: 'sub-route-funding-source-payment-alert-header',
  localizedId: 'sub-route-funding-source-payment-alert',
});

export const PendingAlert = storyWithProps({
  children: 'Updating billing information…',
  className: 'alert-pending',
  dataTestId: 'alert-pending',
  headerId: 'pending-alert-bar-header',
  localizedId: 'alert-bar-pending',
});

export const NewsletterErrorAlertBar = storyWithProps({
  children:
    'You’re not signed up for product update emails. You can try again in your account settings.',
  className: 'alert-newsletter-error',
  dataTestId: 'alert-newsletter',
  headerId: 'newsletter-alert-bar-header',
  localizedId: 'alert-bar-newsletter',
});

export const ShortSuccessAlertBar = storyWithProps({
  children: 'Success!',
  className: 'alert-success',
  dataTestId: 'alert-success-short',
  headerId: 'short-success-alert-bar-header',
  localizedId: 'short-alert-bar',
});

export const ShortSuccessAlertBarClose = storyWithProps({
  children: 'Success!',
  className: 'alert-success',
  dataTestId: 'alert-success-short-close',
  headerId: 'short-success-alert-bar-header-close',
  localizedId: 'short-alert-bar-close',
  onClick: () => {},
});

export const LongSuccessAlertBar = storyWithProps({
  children:
    'Spicy jalapeno bacon ipsum dolor amet voluptate pariatur cupim anim, laboris alcatra biltong swine meatball fatback short loin shankle ea fugiat. Deserunt pork filet mignon, elit in est chicken. Dolore salami minim et. Leberkas chislic laborum cillum cow. Officia occaecat chuck enim, chislic eiusmod t-bone. Adipisicing labore veniam porchetta est rump. Occaecat aute pariatur salami alcatra chislic sunt velit tri-tip aliqua kielbasa mollit beef ribs. Pastrami labore salami ipsum eu laboris, filet mignon enim tenderloin excepteur aliqua buffalo sint lorem. Do beef cupim, drumstick id venison ball tip et pork chop brisket boudin in sed. Tenderloin ball tip id proident ullamco lorem non!',
  className: 'alert-success',
  dataTestId: 'alert-success-long',
  headerId: 'long-success-alert-bar-header',
  localizedId: 'long-alert-bar',
});

export const LongSuccessAlertBarClose = storyWithProps({
  children:
    'Spicy jalapeno bacon ipsum dolor amet voluptate pariatur cupim anim, laboris alcatra biltong swine meatball fatback short loin shankle ea fugiat. Deserunt pork filet mignon, elit in est chicken. Dolore salami minim et. Leberkas chislic laborum cillum cow. Officia occaecat chuck enim, chislic eiusmod t-bone. Adipisicing labore veniam porchetta est rump. Occaecat aute pariatur salami alcatra chislic sunt velit tri-tip aliqua kielbasa mollit beef ribs. Pastrami labore salami ipsum eu laboris, filet mignon enim tenderloin excepteur aliqua buffalo sint lorem. Do beef cupim, drumstick id venison ball tip et pork chop brisket boudin in sed. Tenderloin ball tip id proident ullamco lorem non!',
  className: 'alert-success',
  dataTestId: 'alert-success-long-close',
  headerId: 'long-success-alert-bar-header-close',
  localizedId: 'long-alert-bar-close',
  onClick: () => {},
});

export const LongSuccessAlertBarCheckClose = storyWithProps({
  checked: true,
  children:
    'Spicy jalapeno bacon ipsum dolor amet voluptate pariatur cupim anim, laboris alcatra biltong swine meatball fatback short loin shankle ea fugiat. Deserunt pork filet mignon, elit in est chicken. Dolore salami minim et. Leberkas chislic laborum cillum cow. Officia occaecat chuck enim, chislic eiusmod t-bone. Adipisicing labore veniam porchetta est rump. Occaecat aute pariatur salami alcatra chislic sunt velit tri-tip aliqua kielbasa mollit beef ribs. Pastrami labore salami ipsum eu laboris, filet mignon enim tenderloin excepteur aliqua buffalo sint lorem. Do beef cupim, drumstick id venison ball tip et pork chop brisket boudin in sed. Tenderloin ball tip id proident ullamco lorem non!',
  className: 'alert-success',
  dataTestId: 'alert-success-long-close',
  headerId: 'long-success-alert-bar-header-close',
  localizedId: 'long-alert-bar-close',
  onClick: () => {},
});
