import { assert } from 'chai';
import OAuthRedirectChomeAndroidBroker from 'models/auth_brokers/oauth-redirect-chrome-android';

describe('models/auth_brokers/oauth-redirect-chrome-android', () => {
  var account;
  var broker;

  before(() => {
    account = {};
    broker = new OAuthRedirectChomeAndroidBroker({});
  });

  describe('afterSignInConfirmationPoll', () => {
    it('returns the expected NavigateBehavior', () => {
      const behavior = broker.afterSignInConfirmationPoll(account);
      assert.equal(behavior.type, 'navigate');
      assert.equal(behavior.endpoint, 'signin_confirmed');
      assert.equal(behavior.continueBrokerMethod, 'finishOAuthSignInFlow');
    });
  });

  describe('afterSignUpConfirmationPoll', () => {
    it('returns the expected NavigateBehavior', () => {
      const behavior = broker.afterSignUpConfirmationPoll(account);
      assert.equal(behavior.type, 'navigate');
      assert.equal(behavior.endpoint, 'signup_confirmed');
      assert.equal(behavior.continueBrokerMethod, 'finishOAuthSignUpFlow');
    });
  });
});
