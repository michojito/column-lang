/**
 * Enum representing the different types of tokens in the Column language.
 */
export enum TokenType {
  KEY = "KEY", // Name of a property in a key-value pair
  COLON = "COLON", // Separates key from value
  VALUE = "VALUE", // Value in a key-value pair
  INDENT = "INDENT", // Increase in indentation level
  DEDENT = "DEDENT", // Decrease in indentation level
  NEWLINE = "NEWLINE", // End of line
  LIST_ITEM = "LIST_ITEM", // List item marker (- )
  MULTILINE_START = "MULTILINE_START", // Start of multiline string (| or <)
  MULTILINE_STRING = "MULTILINE_STRING", // Content of multiline string
  MULTILINE_END = "MULTILINE_END", // End of multiline string
  NOTICE = "NOTICE", // Special comment for copyright/license (/!)
  COMMENT = "COMMENT", // Regular comment (//)
  TODO_COMMENT = "TODO_COMMENT", // TODO comment (/=>)
  NAMESPACE_DECLARATION = "NAMESPACE_DECLARATION", // Namespace declaration (@-)
  SECTION_DECLARATION = "SECTION_DECLARATION", // Section declaration (@/)
  ENV_VAR = "ENV_VAR", // Environment variable reference ($_)
  RAW_CONTENT = "RAW_CONTENT", // Raw content enclosed in backticks (`)
  EOF = "EOF", // End of file
}

/**
 * Interface representing the position of a token in the source text.
 */
export interface TokenPosition {
  line: number; // The line number (1-based)
  column: number; // The column number (1-based)
  index: number; // The index in the source string (0-based)
}

/**
 * Class representing a token in the Column language.
 */
export class Token {
  /**
   * Creates a new Token instance.
   * @param type - The token type
   * @param value - The token's value as a string
   * @param position - The token's position in the source
   * @param raw - Optional raw content of the token
   */
  constructor(
    public type: TokenType,
    public value: string,
    public position: TokenPosition,
    public raw?: string
  ) {}

  /**
   * Returns a string representation of the token.
   */
  toString(): string {
    return `Token(${this.type}, "${this.value}", line=${this.position.line}, col=${this.position.column})`;
  }

  /**
   * Checks if this token is equal to another token.
   * @param other - The token to compare against
   * @returns True if the tokens are equal, false otherwise
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
