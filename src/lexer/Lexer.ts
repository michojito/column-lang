import { Token, TokenType } from './Token';

export class Lexer {
  private tokens: Token[] = [];
  private currentLine = 0;
  private currentColumn = 0;
  private inMultilineString = false;
  private multilineStringType: '|' | '<' | null = null;
  private multilineStringBaseIndent = 0;
  private multilineStringContent = '';
  private indentStack: number[] = [0];

  constructor(private input: string) { }

  tokenize(): Token[] {
    const lines = this.input.split('\n');
    for (let i = 0; i < lines.length; i++) {
      this.currentLine = i;
      this.currentColumn = 0;
      this.tokenizeLine(lines[i]);
    }
    this.handleDedents(0);
    if (this.inMultilineString) {
      this.endMultilineString();
    }
    this.addToken(TokenType.EOF, '');
    return this.tokens;
  }

  private tokenizeLine(line: string): void {
    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;

    if (!this.inMultilineString) {
      this.handleIndentation(indent);
    }

    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      if (!this.inMultilineString) {
        this.addToken(TokenType.NEWLINE, '\n');
      }
      return;
    }

    if (this.inMultilineString) {
      this.tokenizeMultilineStringContent(line);
    } else if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/!')) {
      this.addToken(TokenType.SPECIAL_COMMENT, trimmedLine);
    } else if (trimmedLine.startsWith('-')) {
      this.tokenizeListItem(trimmedLine);
    } else if (trimmedLine.startsWith('>')) {
      this.tokenizeNestedObject(trimmedLine);
    } else {
      this.tokenizeKeyValue(trimmedLine);
    }

    if (!this.inMultilineString) {
      this.addToken(TokenType.NEWLINE, '\n');
    }
  }

  private handleIndentation(indent: number): void {
    const currentIndent = this.indentStack[this.indentStack.length - 1];
    if (indent > currentIndent) {
      this.addToken(TokenType.INDENT, ' '.repeat(indent - currentIndent));
      this.indentStack.push(indent);
    } else if (indent < currentIndent) {
      this.handleDedents(indent);
    }
  }

  private handleDedents(indent: number): void {
    while (this.indentStack[this.indentStack.length - 1] > indent) {
      this.indentStack.pop();
      this.addToken(TokenType.DEDENT, '');
    }
  }

  private tokenizeMultilineStringContent(line: string): void {
    const currentIndent = line.match(/^(\s*)/)?.[1]?.length ?? 0;

    if (currentIndent < this.multilineStringBaseIndent) {
      this.endMultilineString();
      this.tokenizeLine(line);
    } else {
      const content = line.slice(this.multilineStringBaseIndent);
      this.multilineStringContent += (this.multilineStringContent ? '\n' : '') + content;
    }
  }

  private endMultilineString(): void {
    if (this.multilineStringContent) {
      this.multilineStringContent = this.multilineStringContent.replace(/\n$/, '');
      this.addToken(TokenType.VALUE, this.multilineStringContent);
    }
    this.inMultilineString = false;
    this.multilineStringType = null;
    this.multilineStringContent = '';
  }

  private tokenizeListItem(line: string): void {
    this.addToken(TokenType.LIST_ITEM, '-');
    const value = line.slice(1).trim();
    if (value) {
      this.tokenizeKeyValue(value);
    }
  }

  private tokenizeNestedObject(line: string): void {
    this.addToken(TokenType.NESTED_OBJECT, '>');
    const rest = line.slice(1).trim();
    if (rest) {
      this.tokenizeKeyValue(rest);
    }
  }

  private tokenizeKeyValue(line: string): void {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      this.addToken(TokenType.KEY, key);
      this.addToken(TokenType.COLON, ':');

      const value = line.slice(colonIndex + 1).trim();
      if (value === '|' || value === '<') {
        this.startMultilineString(value as '|' | '<');
      } else if (value) {
        this.addToken(TokenType.VALUE, value);
      }
    } else {
      this.addToken(TokenType.VALUE, line);
    }
  }

  private startMultilineString(type: '|' | '<'): void {
    this.inMultilineString = true;
    this.multilineStringType = type;
    this.multilineStringBaseIndent = this.indentStack[this.indentStack.length - 1];
    this.multilineStringContent = '';
    this.addToken(TokenType.MULTILINE_START, type);
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({ type, value, line: this.currentLine, column: this.currentColumn });
    this.currentColumn += value.length;
  }
}
