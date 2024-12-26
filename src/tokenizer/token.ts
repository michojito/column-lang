/**
 * Enum representing the different types of tokens.
 */
export enum TokenType {
  KEY = "KEY",
  COLON = "COLON",
  VALUE = "VALUE",
  INDENT = "INDENT",
  DEDENT = "DEDENT",
  NEWLINE = "NEWLINE",
  LIST_ITEM = "LIST_ITEM",
  MULTILINE_START = "MULTILINE_START",
  MULTILINE_STRING = "MULTILINE_STRING",
  MULTILINE_END = "MULTILINE_END",
  NOTICE = "NOTICE",
  COMMENT = "COMMENT",
  TODO_COMMENT = "TODO_COMMENT",
  NAMESPACE_DECLARATION = "NAMESPACE_DECLARATION",
  SECTION_DECLARATION = "SECTION_DECLARATION",
  ENV_VAR = "ENV_VAR",
  RAW_CONTENT = "RAW_CONTENT",
  EOF = "EOF",
}

/**
 * Interface representing the position of a token in the source text.
 */
export interface TokenPosition {
  line: number; // The line number of the token
  column: number; // The column number of the token
  index: number; // The index of the token in the source text
}

/**
 * Class representing a token with its type, value, position, and optional raw content.
 */
export class Token {
  /**
   * Creates a new Token instance.
   * @param type - The type of the token.
   * @param value - The value of the token.
   * @param position - The position of the token.
   * @param raw - Optional raw content of the token.
   */
  constructor(
    public type: TokenType, // The type of the token
    public value: string, // The value of the token
    public position: TokenPosition, // The position of the token
    public raw?: string // Optional raw content of the token
  ) {}

  /**
   * Returns a string representation of the token.
   */
  toString(): string {
    return `Token(${this.type}, "${this.value}", line=${this.position.line}, col=${this.position.column})`;
  }

  /**
   * Checks if this token is equal to another token.
   * @param other - The token to compare against.
   * @returns True if the tokens are equal, false otherwise.
   */
  equals(other: Token): boolean {
    return (
      this.type === other.type &&
      this.value === other.value &&
      this.position.line === other.position.line &&
      this.position.column === other.position.column
    );
  }
}
