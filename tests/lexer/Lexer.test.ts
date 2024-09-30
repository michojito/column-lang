import { Lexer } from '../../src/lexer/Lexer';
import { TokenType } from '../../src/lexer/Token';

describe('Lexer', () => {
  test('tokenizes basic key-value pairs', () => {
    const input = 'name: John Doe\nage: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.KEY, value: 'name', line: 0, column: 0 },
      { type: TokenType.COLON, value: ':', line: 0, column: 4 },
      { type: TokenType.VALUE, value: 'John Doe', line: 0, column: 5 },
      { type: TokenType.NEWLINE, value: '\n', line: 0, column: 13 },
      { type: TokenType.KEY, value: 'age', line: 1, column: 0 },
      { type: TokenType.COLON, value: ':', line: 1, column: 3 },
      { type: TokenType.VALUE, value: '30', line: 1, column: 4 },
      { type: TokenType.NEWLINE, value: '\n', line: 1, column: 6 },
      { type: TokenType.EOF, value: '', line: 1, column: 7 },
    ]);
  });

  test('tokenizes list items', () => {
    const input = 'fruits:\n  - apple\n  - banana';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.KEY, value: 'fruits', line: 0, column: 0 },
      { type: TokenType.COLON, value: ':', line: 0, column: 6 },
      { type: TokenType.NEWLINE, value: '\n', line: 0, column: 7 },
      { type: TokenType.INDENT, value: '  ', line: 1, column: 0 },
      { type: TokenType.LIST_ITEM, value: '-', line: 1, column: 2 },
      { type: TokenType.VALUE, value: 'apple', line: 1, column: 3 },
      { type: TokenType.NEWLINE, value: '\n', line: 1, column: 8 },
      { type: TokenType.LIST_ITEM, value: '-', line: 2, column: 0 },
      { type: TokenType.VALUE, value: 'banana', line: 2, column: 1 },
      { type: TokenType.NEWLINE, value: '\n', line: 2, column: 7 },
      { type: TokenType.DEDENT, value: '', line: 2, column: 8 },
      { type: TokenType.EOF, value: '', line: 2, column: 8 },
    ]);
  });

  test('tokenizes nested objects', () => {
    const input = 'person:\n  > name: John\n    age: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.KEY, value: 'person', line: 0, column: 0 },
      { type: TokenType.COLON, value: ':', line: 0, column: 6 },
      { type: TokenType.NEWLINE, value: '\n', line: 0, column: 7 },
      { type: TokenType.INDENT, value: '  ', line: 1, column: 0 },
      { type: TokenType.NESTED_OBJECT, value: '>', line: 1, column: 2 },
      { type: TokenType.KEY, value: 'name', line: 1, column: 3 },
      { type: TokenType.COLON, value: ':', line: 1, column: 7 },
      { type: TokenType.VALUE, value: 'John', line: 1, column: 8 },
      { type: TokenType.NEWLINE, value: '\n', line: 1, column: 12 },
      { type: TokenType.INDENT, value: '  ', line: 2, column: 0 },
      { type: TokenType.KEY, value: 'age', line: 2, column: 2 },
      { type: TokenType.COLON, value: ':', line: 2, column: 5 },
      { type: TokenType.VALUE, value: '30', line: 2, column: 6 },
      { type: TokenType.NEWLINE, value: '\n', line: 2, column: 8 },
      { type: TokenType.DEDENT, value: '', line: 2, column: 9 },
      { type: TokenType.DEDENT, value: '', line: 2, column: 9 },
      { type: TokenType.EOF, value: '', line: 2, column: 9 },
    ]);
  });

  test('tokenizes multiline strings', () => {
    const input = 'description: |\n  This is a\n  multiline string';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.KEY, value: 'description', line: 0, column: 0 },
      { type: TokenType.COLON, value: ':', line: 0, column: 11 },
      { type: TokenType.MULTILINE_START, value: '|', line: 0, column: 12 },
      { type: TokenType.VALUE, value: '  This is a\n  multiline string', line: 2, column: 0 },
      { type: TokenType.EOF, value: '', line: 2, column: 30 },
    ]);
  });
});
