import { BaseError } from '@fxa/shared/error';

export class EligibilityError extends BaseError {
  constructor(stripeCustomerId: string) {
    super("'uid' is required when 'stripeCustomerId' is provided", {
      info: { stripeCustomerId },
    });
    this.name = 'EligibilityError';
  }
}

export class SubgroupOfferingMissingPositionError extends BaseError {
  constructor(
    groupName: string,
    fromOfferingId: string,
    targetOfferingId: string
  ) {
    super('Subgroup offering is missing a position', {
      info: { groupName, fromOfferingId, targetOfferingId },
    });
    this.name = 'SubgroupOfferingMissingPositionError';
  }
}
