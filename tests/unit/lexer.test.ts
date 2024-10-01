import { Lexer } from '../../src/lexer/Lexer';
import { TokenType } from '../../src/lexer/Token';

describe('Lexer', () => {
  it('should tokenize a simple key-value pair', () => {
    const input = 'key: value';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    expect(tokens).toHaveLength(4); // KEY, COLON, VALUE, EOF
    expect(tokens[0].type).toBe(TokenType.KEY);
    expect(tokens[0].value).toBe('key');
    expect(tokens[1].type).toBe(TokenType.COLON);
    expect(tokens[2].type).toBe(TokenType.VALUE);
    expect(tokens[2].value).toBe('value');
    expect(tokens[3].type).toBe(TokenType.EOF);
  });

  it('should handle indentation', () => {
    const input = `
key1: value1
  nested_key: nested_value
key2: value2
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    const expectedTypes = [
      TokenType.NEWLINE,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.EOF
    ];

    expect(tokens.map(t => t.type)).toEqual(expectedTypes);
  });

  it('should handle indentation and nested structures', () => {
    const input = `
key1: value1
  nested_key: nested_value
    deeply_nested_key: deeply_nested_value
    as_deep_nested_key: as_deep_nested_value
  another_nested_key: another_nested_value
key2: value2
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    const expectedTypes = [
      TokenType.NEWLINE,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.EOF
    ];

    expect(tokens.map(t => t.type)).toEqual(expectedTypes);
  });

  it('should handle empty lines', () => {
    const input = `
key1: value1

key2: value2
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    const expectedTypes = [
      TokenType.NEWLINE,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.NEWLINE,
      TokenType.KEY, TokenType.COLON, TokenType.VALUE, TokenType.NEWLINE,
      TokenType.EOF
    ];

    expect(tokens.map(t => t.type)).toEqual(expectedTypes);
  });
});
