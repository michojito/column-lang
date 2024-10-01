import { Lexer } from '../../src/lexer/Lexer';
import { Parser } from '../../src/parser/Parser';

describe('Parser', () => {
  it('should parse a simple key-value pair', () => {
    const input = 'key: value';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: 'Object',
      properties: [
        { type: 'KeyValuePair', key: 'key', value: 'value' }
      ]
    });
  });

  it('should parse nested objects', () => {
    const input = `
key1: value1
nested:
  key2: value2
  key3: value3
key4: value4
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: 'Object',
      properties: [
        { type: 'KeyValuePair', key: 'key1', value: 'value1' },
        {
          type: 'KeyValuePair',
          key: 'nested',
          value: {
            type: 'Object',
            properties: [
              { type: 'KeyValuePair', key: 'key2', value: 'value2' },
              { type: 'KeyValuePair', key: 'key3', value: 'value3' }
            ]
          }
        },
        { type: 'KeyValuePair', key: 'key4', value: 'value4' }
      ]
    });
  });

  it('should handle empty lines', () => {
    const input = `
key1: value1

key2: value2
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: 'Object',
      properties: [
        { type: 'KeyValuePair', key: 'key1', value: 'value1' },
        { type: 'KeyValuePair', key: 'key2', value: 'value2' }
      ]
    });
  });
});
