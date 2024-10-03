import { Token, TokenType } from '../lexer/Token';
import { KeyValuePair, ObjectNode, RootNode } from './AST';

/**
 * Parser class for the Column language.
 * Transforms a sequence of tokens into an Abstract Syntax Tree (AST).
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  /**
   * Creates a new Parser instance.
   * @param tokens - An array of tokens to be parsed.
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parses the tokens and returns the root node of the AST.
   * @returns The root node of the parsed AST.
   */
  parse(): RootNode {
    const root: RootNode = { type: 'Object', properties: [] };
    this.parseObject(root);
    return root;
  }

  /**
   * Parses an object node, including its properties.
   * @param obj - The object node to be populated with properties.
   */
  private parseObject(obj: ObjectNode): void {
    while (!this.isAtEnd() && !this.check(TokenType.DEDENT)) {
      if (this.match(TokenType.NEWLINE)) continue;
      if (this.match(TokenType.INDENT)) continue;

      const keyValuePair = this.parseKeyValuePair();
      if (keyValuePair) {
        obj.properties.push(keyValuePair);
      }
    }

    // Consume the DEDENT token if it exists
    this.match(TokenType.DEDENT);
  }

  /**
   * Parses a key-value pair.
   * @returns A KeyValuePair object if successful, null otherwise.
   */
  private parseKeyValuePair(): KeyValuePair | null {
    if (!this.check(TokenType.KEY)) return null;

    const key = this.consume(TokenType.KEY, "Expect key.").value;
    this.consume(TokenType.COLON, "Expect ':' after key.");

    let value: string | ObjectNode;
    if (this.check(TokenType.VALUE)) {
      value = this.consume(TokenType.VALUE, "Expect value.").value;
    } else if (this.check(TokenType.NEWLINE)) {
      // If there's a newline after the colon, it's a nested object
      this.advance(); // Consume the newline
      value = { type: 'Object', properties: [] };
      this.parseObject(value);
    } else {
      throw new Error(`Unexpected token after colon: ${this.peek().toString()}`);
    }

    return { type: 'KeyValuePair', key, value };
  }

  /**
   * Checks if the current token matches any of the given types and advances if so.
   * @param types - The token types to match against.
   * @returns True if a match was found and consumed, false otherwise.
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the current token is of the given type.
   * @param type - The token type to check against.
   * @returns True if the current token is of the given type, false otherwise.
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Advances to the next token and returns the previous one.
   * @returns The token that was just consumed.
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * Consumes the current token if it's of the expected type, otherwise throws an error.
   * @param type - The expected token type.
   * @param message - The error message to use if the token doesn't match.
   * @returns The consumed token.
   * @throws Error if the current token is not of the expected type.
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} ${this.peek().toString()}`);
  }

  /**
   * Checks if we've reached the end of the token stream.
   * @returns True if we're at the end of the token stream, false otherwise.
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Returns the current token without consuming it.
   * @returns The current token.
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Returns the previous token.
   * @returns The previously consumed token.
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
