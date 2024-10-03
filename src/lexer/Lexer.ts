import { Token, TokenType } from './Token';

/**
 * Lexer class for tokenizing input
 */
export class Lexer {
  /** Input string to be tokenized */
  private input: string;
  /** Current position in the input */
  private position: number = 0;
  /** Current line number */
  private line: number = 1;
  /** Current column number */
  private column: number = 0;
  /** Stack to keep track of indentation levels */
  private indentStack: number[] = [0];

  /**
   * Constructor to initialize the Lexer with input
   * @param input The input string to tokenize
   */
  constructor(input: string) {
    this.input = input;
  }

  /**
   * Method to tokenize the entire input
   * @returns An array of Token objects
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let token: Token | null;

    while ((token = this.nextToken()) !== null) {
      tokens.push(token);
    }

    while (this.indentStack.length > 1) {
      tokens.push(new Token(TokenType.DEDENT, '', this.line, this.column));
      this.indentStack.pop();
    }

    tokens.push(new Token(TokenType.EOF, '', this.line, this.column));
    return tokens;
  }

  /**
   * Method to get the next token
   * @returns The next Token object or null if end of input is reached
   */
  private nextToken(): Token | null {
    if (this.position >= this.input.length) {
      return null;
    }

    if (this.column === 0) {
      const indentToken = this.handleIndentation();
      if (indentToken) return indentToken;
    }

    const char = this.current();

    if (char === '\n') {
      return this.handleNewline();
    }

    if (this.isKeyStart(char)) {
      return this.readKey();
    }

    if (char === ':') {
      this.advance();
      return new Token(TokenType.COLON, ':', this.line, this.column - 1);
    }

    return this.readValue();
  }

  /**
   * Method to handle indentation
   * @returns A Token object for indentation or null if no change in indentation
   */
  private handleIndentation(): Token | null {
    let spaces = 0;
    while (this.position < this.input.length && this.current() === ' ') {
      spaces++;
      this.advance();
    }

    const currentIndent = spaces;
    const previousIndent = this.indentStack[this.indentStack.length - 1];

    if (currentIndent > previousIndent) {
      this.indentStack.push(currentIndent);
      return new Token(TokenType.INDENT, ' '.repeat(currentIndent), this.line, this.column - currentIndent);
    } else if (currentIndent < previousIndent) {
      this.indentStack.pop();
      return new Token(TokenType.DEDENT, '', this.line, this.column);
    }

    return null;
  }

  /**
   * Method to check if a character can start a key
   * @param char The character to check
   * @returns True if the character can start a key, false otherwise
   */
  private isKeyStart(char: string): boolean {
    return /[a-zA-Z0-9_-]/.test(char);
  }

  /**
   * Method to read a key
   * @returns A Token object representing the key
   */
  private readKey(): Token {
    const start = this.position;
    while (this.position < this.input.length && this.current() !== ':' && this.current() !== '\n') {
      this.advance();
    }
    const content = this.input.slice(start, this.position).trim();
    return new Token(TokenType.KEY, content, this.line, this.column - content.length);
  }

  /**
   * Method to read a value
   * @returns A Token object representing the value
   */
  private readValue(): Token {
    const start = this.position;
    while (this.position < this.input.length && this.current() !== '\n') {
      this.advance();
    }
    const content = this.input.slice(start, this.position).trim();
    return new Token(TokenType.VALUE, content, this.line, this.column - content.length);
  }

  /**
   * Method to handle newline characters
   * @returns A Token object representing the newline
   */
  private handleNewline(): Token {
    this.advance();
    this.line++;
    this.column = 0;
    return new Token(TokenType.NEWLINE, '\n', this.line - 1, this.column);
  }

  /**
   * Method to get the current character
   * @returns The current character in the input
   */
  private current(): string {
    return this.input[this.position];
  }

  /**
   * Method to advance the position and column
   */
  private advance(): void {
    this.position++;
    this.column++;
  }
}
