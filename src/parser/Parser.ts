import { Token, TokenType } from '../lexer/Token';
import { KeyValuePair, ObjectNode, RootNode } from './AST';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): RootNode {
    const root: RootNode = { type: 'Object', properties: [] };
    this.parseObject(root);
    return root;
  }

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

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} ${this.peek().toString()}`);
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
