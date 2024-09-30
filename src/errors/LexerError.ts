export class LexerError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number
  ) {
    super(`Line ${line}, Column ${column}: ${message}`);
    this.name = 'LexerError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toString(): string {
    return `${this.name}: ${this.message}`;
  }

  public getStackTrace(): string {
    return this.stack || '';
  }
}
