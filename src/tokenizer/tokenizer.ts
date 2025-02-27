import { Token, TokenType, TokenPosition } from "./token";
import { TokenizationError } from "../utils/errors";

/**
 * Responsible for breaking down Column source code into tokens.
 */
export class Tokenizer {
  private source: string;
  private position: TokenPosition = {
    index: 0,
    line: 1,
    column: 1,
  };

  /**
   * Creates a new Tokenizer.
   * @param source - The source code to tokenize
   */
  constructor(source: string) {
    this.source = source;
  }

  /**
   * Returns the current character in the source.
   */
  private get current(): string {
    return this.position.index < this.source.length
      ? this.source[this.position.index]
      : "\0"; // Return null character if past the end
  }

  /**
   * Returns the next character in the source.
   */
  private get next(): string {
    return this.position.index + 1 < this.source.length
      ? this.source[this.position.index + 1]
      : "\0";
  }

  /**
   * Peeks ahead n characters in the source.
   * @param n - Number of characters to peek ahead
   * @returns The character at that position or null character if out of bounds
   */
  private peek(n: number = 1): string {
    return this.position.index + n < this.source.length
      ? this.source[this.position.index + n]
      : "\0";
  }

  /**
   * Checks if there are more characters to process.
   */
  private get hasMore(): boolean {
    return this.position.index < this.source.length;
  }

  /**
   * Advances to the next character in the source.
   * @returns The character that was just processed
   */
  private advance(): string {
    const char = this.current;
    this.position.index++;

    if (char === "\n") {
      this.position.line++;
      this.position.column = 1;
    } else {
      this.position.column++;
    }

    return char;
  }

  /**
   * Creates a token with the current position information.
   * @param type - The token type
   * @param value - The token value
   * @returns A new Token instance
   */
  private createToken(type: TokenType, value: string): Token {
    const startIndex = this.position.index - value.length;
    const startColumn = this.position.column - value.length;

    return new Token(type, value, {
      line: this.position.line,
      column: type === TokenType.NEWLINE ? startColumn : startColumn + 1,
      index: startIndex,
    });
  }

  /**
   * Reads an identifier (key) from the source.
   * This handles alphanumeric characters, underscores, hyphens, and periods.
   * @returns A token of type KEY
   */
  private readIdentifier(): Token {
    let value = "";
    const startColumn = this.position.column;

    // Allow a wider range of characters in identifiers:
    // - alphanumeric characters (a-z, A-Z, 0-9)
    // - underscores (_)
    // - hyphens (-)
    // - periods (.) for version numbers
    // - carets (^) for version ranges
    // - plus (+) for version specifiers
    while (this.hasMore && /[a-zA-Z0-9_\-\.\^+]/.test(this.current)) {
      value += this.advance();
    }

    return new Token(TokenType.KEY, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length,
    });
  }

  /**
   * Reads a quoted key from the source.
   * @returns A token of type KEY
   */
  private readQuotedKey(): Token {
    let value = "";
    const startColumn = this.position.column;

    // Skip opening quote
    this.advance();

    while (this.hasMore && this.current !== '"') {
      // Handle escape sequences
      if (this.current === "\\") {
        this.advance();

        // Handle common escape sequences
        if (this.current === "n") {
          value += "\n";
        } else if (this.current === "t") {
          value += "\t";
        } else if (this.current === "r") {
          value += "\r";
        } else {
          value += this.current;
        }

        this.advance();
      } else {
        value += this.advance();
      }
    }

    if (!this.hasMore) {
      throw new TokenizationError("Unterminated quoted key", this.position);
    }

    // Skip closing quote
    this.advance();

    return new Token(TokenType.KEY, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length - 2, // -2 for quotes
    });
  }

  /**
   * Reads a comment from the source.
   * @returns A token of type COMMENT
   */
  private readComment(): Token {
    let value = "//";
    const startColumn = this.position.column;

    // Skip //
    this.advance();
    this.advance();

    // Read until end of line
    while (this.hasMore && this.current !== "\n") {
      value += this.advance();
    }

    return new Token(TokenType.COMMENT, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length + 2, // +2 to offset the //
    });
  }

  /**
   * Reads a notice comment (/!) from the source.
   * @returns A token of type NOTICE
   */
  private readNotice(): Token {
    let value = "/!";
    const startColumn = this.position.column;

    // Skip /!
    this.advance();
    this.advance();

    // Read until end of line
    while (this.hasMore && this.current !== "\n") {
      value += this.advance();
    }

    return new Token(TokenType.NOTICE, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length + 2, // +2 to offset the /!
    });
  }

  /**
   * Reads a TODO comment (/=>) from the source.
   * @returns A token of type TODO_COMMENT
   */
  private readTodoComment(): Token {
    let value = "/=>";
    const startColumn = this.position.column;

    // Skip /=>
    this.advance();
    this.advance();
    this.advance();

    // Read until end of line
    while (this.hasMore && this.current !== "\n") {
      value += this.advance();
    }

    return new Token(TokenType.TODO_COMMENT, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length + 3, // +3 to offset the /=>
    });
  }

  /**
   * Reads a namespace declaration (@-) from the source.
   * @returns A token of type NAMESPACE_DECLARATION
   */
  private readNamespaceDeclaration(): Token {
    let value = "@-";
    const startColumn = this.position.column;

    // Skip @-
    this.advance();
    this.advance();

    // Skip whitespace
    while (this.hasMore && (this.current === " " || this.current === "\t")) {
      value += this.advance();
    }

    // Read namespace name
    while (this.hasMore && this.current !== "\n" && this.current !== "/") {
      value += this.advance();
    }

    return new Token(TokenType.NAMESPACE_DECLARATION, value.trim(), {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length + 2, // +2 to offset the @-
    });
  }

  /**
   * Reads a section declaration (@/) from the source.
   * @returns A token of type SECTION_DECLARATION
   */
  private readSectionDeclaration(): Token {
    let value = "@/";
    const startColumn = this.position.column;

    // Skip @/
    this.advance();
    this.advance();

    // Skip whitespace
    while (this.hasMore && (this.current === " " || this.current === "\t")) {
      value += this.advance();
    }

    // Read section name
    while (this.hasMore && this.current !== "\n" && this.current !== "/") {
      value += this.advance();
    }

    return new Token(TokenType.SECTION_DECLARATION, value.trim(), {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length + 2, // +2 to offset the @/
    });
  }

  /**
   * Reads a list item marker (-) from the source.
   * @returns A token of type LIST_ITEM
   */
  private readListItem(): Token {
    const startColumn = this.position.column;

    // Skip -
    this.advance();

    // Ensure there's a space after the -
    if (this.current !== " ") {
      throw new TokenizationError(
        "List item marker must be followed by a space",
        this.position
      );
    }

    // Skip space
    this.advance();

    return new Token(TokenType.LIST_ITEM, "-", {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - 2, // -2 for - and space
    });
  }

  /**
   * Reads a value from the source.
   * @returns A token of type VALUE
   */
  private readValue(): Token {
    let value = "";
    const startColumn = this.position.column;

    // Skip leading whitespace
    while (this.hasMore && (this.current === " " || this.current === "\t")) {
      this.advance();
    }

    // Handle multiline start with plus (|+)
    if (this.current === "|" && this.next === "+") {
      const position = { ...this.position };
      this.advance(); // Skip |
      this.advance(); // Skip +
      return new Token(TokenType.MULTILINE_START, "|+", {
        line: position.line,
        column: position.column,
        index: position.index,
      });
    }

    // Handle multiline start
    if (this.current === "|" || this.current === "<") {
      const marker = this.current;
      const position = { ...this.position };
      this.advance();
      return new Token(TokenType.MULTILINE_START, marker, {
        line: position.line,
        column: position.column,
        index: position.index,
      });
    }

    // Handle raw content
    if (this.current === "`") {
      return this.readRawContent();
    }

    // Handle environment variable
    if (this.current === "$" && this.next === "_") {
      return this.readEnvVar();
    }

    // Read value until end of line or comment
    // Allow all printable characters in values
    while (
      this.hasMore &&
      this.current !== "\n" &&
      !(
        this.current === "/" &&
        (this.next === "/" || this.next === "=" || this.next === "!")
      )
    ) {
      value += this.advance();
    }

    return new Token(TokenType.VALUE, value.trim(), {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length,
    });
  }

  /**
   * Reads raw content enclosed in backticks.
   * @returns A token of type RAW_CONTENT
   */
  private readRawContent(): Token {
    let value = "";
    const startColumn = this.position.column;

    // Skip opening backtick
    this.advance();

    while (this.hasMore && this.current !== "`") {
      // Handle escape sequences
      if (this.current === "\\") {
        this.advance();
        if (this.current === "`") {
          value += "`"; // Escaped backtick
        } else {
          value += "\\" + this.current;
        }
        this.advance();
      } else {
        value += this.advance();
      }
    }

    if (!this.hasMore) {
      throw new TokenizationError("Unterminated raw content", this.position);
    }

    // Skip closing backtick
    this.advance();

    return new Token(TokenType.RAW_CONTENT, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length - 2, // -2 for backticks
    });
  }

  /**
   * Reads an environment variable reference ($_VAR).
   * @returns A token of type ENV_VAR
   */
  private readEnvVar(): Token {
    let value = "$_";
    const startColumn = this.position.column;

    // Skip $_
    this.advance();
    this.advance();

    // Read environment variable name
    while (this.hasMore && /[A-Z0-9_]/.test(this.current)) {
      value += this.advance();
    }

    // Skip whitespace
    while (this.hasMore && (this.current === " " || this.current === "\t")) {
      this.advance();
    }

    // Check for default value (||)
    if (this.current === "|" && this.next === "|") {
      value += " ||";
      this.advance(); // Skip first |
      this.advance(); // Skip second |

      // Skip whitespace after ||
      while (this.hasMore && (this.current === " " || this.current === "\t")) {
        value += this.advance();
      }

      // Read default value
      while (
        this.hasMore &&
        this.current !== "\n" &&
        !(
          this.current === "/" &&
          (this.next === "/" || this.next === "=" || this.next === "!")
        )
      ) {
        value += this.advance();
      }
    }

    return new Token(TokenType.ENV_VAR, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length,
    });
  }

  /**
   * Gets the next token from the source.
   * @returns The next token
   */
  public nextToken(): Token {
    // If we're at the end of the source
    if (!this.hasMore) {
      return this.createToken(TokenType.EOF, "");
    }

    // Handle whitespace
    if (this.current === " " || this.current === "\t") {
      this.advance();
      return this.nextToken();
    }

    // Handle newline
    if (this.current === "\n") {
      const token = this.createToken(TokenType.NEWLINE, "\n");
      this.advance();
      return token;
    }

    // Handle multiline start with plus (|+)
    if (this.current === "|" && this.next === "+") {
      const position = { ...this.position };
      this.advance(); // Skip |
      this.advance(); // Skip +
      return new Token(TokenType.MULTILINE_START, "|+", {
        line: position.line,
        column: position.column,
        index: position.index,
      });
    }

    // Handle multiline start
    if (this.current === "|" || this.current === "<") {
      const marker = this.current;
      const position = { ...this.position };
      this.advance();
      return new Token(TokenType.MULTILINE_START, marker, {
        line: position.line,
        column: position.column,
        index: position.index,
      });
    }

    // Handle colon
    if (this.current === ":") {
      const token = this.createToken(TokenType.COLON, ":");
      this.advance();
      return token;
    }

    // Handle comments
    if (this.current === "/") {
      if (this.next === "/") {
        return this.readComment();
      } else if (this.next === "!") {
        return this.readNotice();
      } else if (this.next === "=" && this.peek(2) === ">") {
        return this.readTodoComment();
      }
    }

    // Handle namespace and section declarations
    if (this.current === "@") {
      if (this.next === "-") {
        return this.readNamespaceDeclaration();
      } else if (this.next === "/") {
        return this.readSectionDeclaration();
      }
    }

    // Handle list items
    if (this.current === "-" && this.next === " ") {
      return this.readListItem();
    }

    // Handle quoted key
    if (this.current === '"') {
      return this.readQuotedKey();
    }

    // Handle environment variable
    if (this.current === "$" && this.next === "_") {
      return this.readEnvVar();
    }

    // Handle raw content
    if (this.current === "`") {
      return this.readRawContent();
    }

    // Handle key
    if (/[a-zA-Z0-9_-]/.test(this.current)) {
      return this.readIdentifier();
    }

    // Handle value (after colon)
    if (this.current === " " || this.current === "\t") {
      return this.readValue();
    }

    // If we get here, we encountered an unexpected character
    throw new TokenizationError(
      `Unexpected character: ${this.current}`,
      this.position
    );
  }

  /**
   * Tokenizes the entire source and returns all tokens.
   * @returns An array of tokens
   */
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token: Token;

    do {
      token = this.nextToken();
      tokens.push(token);
    } while (token.type !== TokenType.EOF);

    return tokens;
  }
}
