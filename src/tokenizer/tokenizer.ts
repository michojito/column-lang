import { Token, TokenType, TokenPosition } from "./token";

export class Tokenizer {
  private source: string;
  private position: TokenPosition = {
    index: 0,
    line: 1,
    column: 1,
  };

  constructor(source: string) {
    this.source = source;
  }

  private get current(): string {
    return this.position.index < this.source.length
      ? this.source[this.position.index]
      : "\0";
  }

  private get hasMore(): boolean {
    return this.position.index < this.source.length;
  }

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

  private createToken(type: TokenType, value: string): Token {
    const startIndex = this.position.index - value.length;
    const startColumn = this.position.column - value.length;

    return new Token(type, value, {
      line: this.position.line,
      column: type === TokenType.NEWLINE ? startColumn : startColumn + 1,
      index: startIndex,
    });
  }

  public nextToken(): Token {
    while (this.hasMore) {
      if (this.current === " " || this.current === "\t") {
        this.advance();
        continue;
      }

      if (this.current === "\n") {
        const token = this.createToken(TokenType.NEWLINE, "\n");
        this.advance();
        return token;
      }

      if (this.current === ":") {
        const token = this.createToken(TokenType.COLON, ":");
        this.advance();
        return token;
      }

      return this.readIdentifier();
    }

    return this.createToken(TokenType.EOF, "");
  }

  private readIdentifier(): Token {
    let value = "";
    const startColumn = this.position.column;

    while (this.hasMore && /[a-zA-Z0-9_-]/.test(this.current)) {
      value += this.advance();
    }

    return new Token(TokenType.KEY, value, {
      line: this.position.line,
      column: startColumn,
      index: this.position.index - value.length,
    });
  }

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
