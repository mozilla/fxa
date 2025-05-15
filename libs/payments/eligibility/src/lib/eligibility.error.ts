import { BaseError } from '@fxa/shared/error';

export class EligibilityError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'EligibilityError';
    Object.setPrototypeOf(this, EligibilityError.prototype);
  }
}
