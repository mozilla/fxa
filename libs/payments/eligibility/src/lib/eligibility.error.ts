import { BaseError } from '@fxa/shared/error';

export class EligibilityError extends BaseError {
  constructor(stripeCustomerId: string) {
    super("'uid' is required when 'stripeCustomerId' is provided", {
      info: { stripeCustomerId },
    });
    this.name = 'EligibilityError';
  }
}
