import { Lexer } from '../../src/lexer/Lexer';
import { Parser } from '../../src/parser/Parser';
import { ColumnObject } from '../../src/types/ColumnTypes';

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  test('should parse simple key-value pairs', () => {
    const input = 'name: John Doe\nage: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const result = parser.parse(tokens);

    const expected: ColumnObject = {
      name: 'John Doe',
      age: 30
    };

    expect(result).toEqual(expected);
  });

  test('should parse nested objects', () => {
    const input = 'person:\n  > name: John Doe\n    age: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const result = parser.parse(tokens);

    const expected = {
      person: {
        name: 'John Doe',
        age: 30
      }
    };

    expect(result).toEqual(expected);
  });

  test('should parse lists', () => {
    const input = 'fruits:\n  - apple\n  - banana\n  - orange';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const result = parser.parse(tokens);

    const expected = {
      fruits: ['apple', 'banana', 'orange']
    };

    expect(result).toEqual(expected);
  });

  test('should parse multiline strings', () => {
    const input = 'description: |\n  This is a\n  multiline string';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const result = parser.parse(tokens);

    const expected = {
      description: 'This is a\n  multiline string'
    };

    expect(result).toEqual(expected);
  });

  test('should parse special types', () => {
    const input = 'nullValue: ?\ntrueValue: true\nfalseValue: false\nnumber: 42';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const result = parser.parse(tokens);

    const expected: ColumnObject = {
      nullValue: null,
      trueValue: true,
      falseValue: false,
      number: 42
    };

    expect(result).toEqual(expected);
  });
});
