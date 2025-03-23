export abstract class FastMCPError extends Error {
  public constructor(message?: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnexpectedStateError extends FastMCPError {
  public extras?: Record<string, unknown>;

  public constructor(message: string, extras?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.extras = extras;
  }
}

/**
 * An error that is meant to be surfaced to the user.
 */
export class UserError extends UnexpectedStateError {}