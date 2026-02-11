export class PaypalFailure extends Error {}

export class RefusedError extends PaypalFailure {
  public constructor(
    message: string,
    public readonly longMessage: string,
    public readonly errorCode: string
  ) {
    super(message);
    this.name = 'RefusedError';
  }
}
