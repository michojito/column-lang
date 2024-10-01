// Import necessary types from Token file
import { Token, TokenType } from './Token';

// Lexer class for tokenizing input
export class Lexer {
  private input: string; // Input string to be tokenized
  private position: number = 0; // Current position in the input
  private line: number = 1; // Current line number
  private column: number = 0; // Current column number
  private indentStack: number[] = [0]; // Stack to keep track of indentation levels

  // Constructor to initialize the Lexer with input
  constructor(input: string) {
    this.input = input;
  }

  // Method to tokenize the entire input
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let token: Token | null;

    // Continue tokenizing until no more tokens are found
    while ((token = this.nextToken()) !== null) {
      tokens.push(token);
    }

    // Add dedents for any remaining indents
    while (this.indentStack.length > 1) {
      tokens.push(new Token(TokenType.DEDENT, '', this.line, this.column));
      this.indentStack.pop();
    }

    // Add EOF token at the end
    tokens.push(new Token(TokenType.EOF, '', this.line, this.column));
    return tokens;
  }

  // Method to get the next token
  private nextToken(): Token | null {
    // Return null if end of input is reached
    if (this.position >= this.input.length) {
      return null;
    }

    // Handle indentation at the start of each line
    if (this.column === 0) {
      const indentToken = this.handleIndentation();
      if (indentToken) return indentToken;
    }

    const char = this.current();

    // Handle newline characters
    if (char === '\n') {
      return this.handleNewline();
    }

    // Handle keys
    if (this.isKeyStart(char)) {
      return this.readKey();
    }

    // Handle colon (key-value separator)
    if (char === ':') {
      this.advance();
      return new Token(TokenType.COLON, ':', this.line, this.column - 1);
    }

    // If we're not at the start of the line and not reading a key, it must be a value
    return this.readValue();
  }

  // Method to handle indentation
  private handleIndentation(): Token | null {
    let spaces = 0;
    while (this.position < this.input.length && this.current() === ' ') {
      spaces++;
      this.advance();
    }

    const currentIndent = spaces;
    const previousIndent = this.indentStack[this.indentStack.length - 1];

    // Handle increase in indentation
    if (currentIndent > previousIndent) {
      this.indentStack.push(currentIndent);
      return new Token(TokenType.INDENT, ' '.repeat(currentIndent), this.line, this.column - currentIndent);
    } else if (currentIndent < previousIndent) {
      // Handle decrease in indentation
      this.indentStack.pop();
      return new Token(TokenType.DEDENT, '', this.line, this.column);
    }

    // Return null if there's no change in indentation
    return null;
  }

  // Method to check if a character can start a key
  private isKeyStart(char: string): boolean {
    return /[a-zA-Z0-9_-]/.test(char);
  }

  // Method to read a key
  private readKey(): Token {
    const start = this.position;
    while (this.position < this.input.length && this.current() !== ':' && this.current() !== '\n') {
      this.advance();
    }
    const content = this.input.slice(start, this.position).trim();
    return new Token(TokenType.KEY, content, this.line, this.column - content.length);
  }

  // Method to read a value
  private readValue(): Token {
    const start = this.position;
    while (this.position < this.input.length && this.current() !== '\n') {
      this.advance();
    }
    const content = this.input.slice(start, this.position).trim();
    return new Token(TokenType.VALUE, content, this.line, this.column - content.length);
  }

  // Method to handle newline characters
  private handleNewline(): Token {
    this.advance();
    this.line++;
    this.column = 0;
    return new Token(TokenType.NEWLINE, '\n', this.line - 1, this.column);
  }

  // Method to get the current character
  private current(): string {
    return this.input[this.position];
  }

  // Method to advance the position and column
  private advance(): void {
    this.position++;
    this.column++;
  }
}
