import { ParserError } from '../errors/ParserError';
import { Token, TokenType } from '../lexer/Token';
import { ColumnArray, ColumnObject, ColumnValue } from '../types/ColumnTypes';

export class Parser {
  private tokens: Token[];
  private currentTokenIndex: number = 0;
  private specialComments: string[] = [];

  constructor() {
    this.tokens = [];
  }

  parse(tokens: Token[]): ColumnObject {
    this.tokens = tokens;
    this.currentTokenIndex = 0;
    this.specialComments = [];
    this.parseSpecialComments();
    const result = this.parseObject();
    return result;
  }

  private parseSpecialComments(): void {
    while (this.peek().type === TokenType.SPECIAL_COMMENT) {
      const token = this.consume(TokenType.SPECIAL_COMMENT);
      this.specialComments.push(token.value.slice(2).trim());
    }
  }

  private parseObject(baseIndent: number = -1): ColumnObject {
    const obj: ColumnObject = {};

    while (!this.isAtEnd()) {
      this.skipNewlinesAndIndents();
      const currentIndent = this.getCurrentIndentLevel();

      if (this.isAtEnd() || currentIndent <= baseIndent) {
        break;
      }

      if (this.peek().type === TokenType.KEY) {
        const key = this.consume(TokenType.KEY).value;
        this.consume(TokenType.COLON);
        obj[key] = this.parseValue(currentIndent);
      } else if (this.peek().type === TokenType.NESTED_OBJECT) {
        this.consume(TokenType.NESTED_OBJECT);
        const nestedObj = this.parseObject(currentIndent);
        // Instead of Object.assign, we'll create a new nested object
        const key = Object.keys(nestedObj)[0];
        obj[key] = nestedObj[key];
      } else {
        break;
      }
    }

    return obj;
  }

  private parseNestedObject(baseIndent: number): ColumnObject {
    this.consume(TokenType.NESTED_OBJECT);
    this.skipNewlinesAndIndents();
    const nestedBaseIndent = this.getCurrentIndentLevel();
    return this.parseObject(nestedBaseIndent - 1);
  }

  private parseValue(baseIndent: number): ColumnValue {
    const token = this.peek();

    switch (token.type) {
      case TokenType.VALUE:
        return this.parseSimpleValue();
      case TokenType.MULTILINE_START:
        return this.parseMultilineString(baseIndent);
      case TokenType.NESTED_OBJECT:
        return this.parseNestedObject(baseIndent);
      case TokenType.LIST_ITEM:
        return this.parseList(baseIndent);
      case TokenType.NEWLINE:
      case TokenType.INDENT:
      case TokenType.DEDENT:
        this.advance();
        return this.parseValue(baseIndent);
      default:
        throw new ParserError(`Unexpected token: ${token.value}`, token.line, token.column);
    }
  }

  private parseSimpleValue(): ColumnValue {
    const token = this.consume(TokenType.VALUE);
    return this.parseValueString(token.value);
  }

  private parseList(baseIndent: number): ColumnArray {
    const list: ColumnArray = [];

    while (!this.isAtEnd()) {
      this.skipNewlinesAndIndents();
      const currentIndent = this.getCurrentIndentLevel();

      if (currentIndent < baseIndent) {
        break;
      }

      if (this.peek().type === TokenType.LIST_ITEM) {
        this.consume(TokenType.LIST_ITEM);
        const value = this.parseValue(currentIndent);
        list.push(value);
      } else {
        break;
      }
    }

    return list;
  }

  private parseMultilineString(baseIndent: number): string {
    const token = this.peek();

    if (token.type === TokenType.VALUE) {
      return this.parseSimpleValue() as string;
    }

    const startToken = this.consume(TokenType.MULTILINE_START);
    const preserveNewlines = startToken.value === '|';
    let content = '';
    let firstLine = true;

    while (!this.isAtEnd()) {
      this.skipNewlinesAndIndents();
      const currentIndent = this.getCurrentIndentLevel();

      if (currentIndent <= baseIndent && !firstLine) {
        break;
      }

      if (this.peek().type === TokenType.VALUE) {
        const line = this.consume(TokenType.VALUE).value;
        const trimmedLine = firstLine ? line.trim() : line.slice(baseIndent + 2);
        content += (firstLine ? '' : '\n') + trimmedLine;
        firstLine = false;
      } else {
        break;
      }
    }

    const result = preserveNewlines ? content : content.replace(/\n+/g, ' ').trim();
    return result;
  }

  private parseValueString(value: string): ColumnValue {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null' || value === '?') return null;
    if (value.startsWith('$_')) return process.env[value.slice(2)] || '';
    if (value.startsWith('`') && value.endsWith('`')) return value.slice(1, -1);
    if (!isNaN(Number(value))) return Number(value);
    if (value.startsWith('[') && value.endsWith(']')) {
      return value.slice(1, -1).split(',').map(item => this.parseValueString(item.trim()));
    }
    return value;
  }

  private skipNewlinesAndIndents(): void {
    while (this.peek().type === TokenType.NEWLINE || this.peek().type === TokenType.INDENT || this.peek().type === TokenType.DEDENT) {
      this.advance();
    }
  }

  private getCurrentIndentLevel(): number {
    let indentLevel = 0;
    let currentIndex = this.currentTokenIndex;
    while (currentIndex > 0 && this.tokens[currentIndex - 1].type !== TokenType.NEWLINE) {
      currentIndex--;
    }
    while (currentIndex < this.tokens.length && this.tokens[currentIndex].type === TokenType.INDENT) {
      indentLevel += this.tokens[currentIndex].value.length;
      currentIndex++;
    }
    return indentLevel;
  }

  private consume(type: TokenType): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new ParserError(`Expected ${type}, but found ${token.type}`, token.line, token.column);
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.currentTokenIndex++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.currentTokenIndex];
  }

  private previous(): Token {
    return this.tokens[this.currentTokenIndex - 1];
  }

  getSpecialComments(): string[] {
    return this.specialComments;
  }
}
