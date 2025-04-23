import { BaseError } from '@fxa/shared/error';

export class EligibilityError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}
