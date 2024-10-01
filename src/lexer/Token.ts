/**
 * Enum representing different types of tokens in the Column language.
 */
export enum TokenType {
  KEY = 'KEY',
  COLON = 'COLON',
  VALUE = 'VALUE',
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF'
}

/**
 * Represents a token in the Column language.
 */
export class Token {
  /**
   * Creates a new Token instance.
   * @param type The type of the token.
   * @param value The value of the token.
   * @param line The line number where the token appears.
   * @param column The column number where the token starts.
   */
  constructor(
    public type: TokenType,
    public value: string,
    public line: number,
    public column: number
  ) { }

  /**
   * Returns a string representation of the token.
   * @returns A string describing the token's type, value, line, and column.
   */
  toString(): string {
    return `Token(${TokenType[this.type]}, '${this.value}', line=${this.line}, column=${this.column})`;
  }
}
