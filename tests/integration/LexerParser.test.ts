import { Lexer } from '../../src/lexer/Lexer';
import { Parser } from '../../src/parser/Parser';

describe('Lexer and Parser Integration', () => {
  it('should correctly parse a complex Column structure', () => {
    const input = `
main_key: main_value
nested_object:
  key1: value1
  key2: value2
  deeper_nested:
    key3: value3
    key4: value4
another_key: another_value
`;

    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: 'Object',
      properties: [
        { type: 'KeyValuePair', key: 'main_key', value: 'main_value' },
        {
          type: 'KeyValuePair',
          key: 'nested_object',
          value: {
            type: 'Object',
            properties: [
              { type: 'KeyValuePair', key: 'key1', value: 'value1' },
              { type: 'KeyValuePair', key: 'key2', value: 'value2' },
              {
                type: 'KeyValuePair',
                key: 'deeper_nested',
                value: {
                  type: 'Object',
                  properties: [
                    { type: 'KeyValuePair', key: 'key3', value: 'value3' },
                    { type: 'KeyValuePair', key: 'key4', value: 'value4' }
                  ]
                }
              }
            ]
          }
        },
        { type: 'KeyValuePair', key: 'another_key', value: 'another_value' }
      ]
    });
  });

  it('should handle mixed indentation levels', () => {
    const input = `
key1: value1
  nested1: nested_value1
    deep_nested: deep_value
  nested2: nested_value2
key2: value2
`;

    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    expect(ast).toEqual({
      type: 'Object',
      properties: [
        {
          type: 'KeyValuePair',
          key: 'key1',
          value: {
            type: 'Object',
            properties: [
              { type: 'KeyValuePair', key: 'nested1', value: 'nested_value1' },
              {
                type: 'KeyValuePair',
                key: 'deep_nested',
                value: 'deep_value'
              },
              { type: 'KeyValuePair', key: 'nested2', value: 'nested_value2' }
            ]
          }
        },
        { type: 'KeyValuePair', key: 'key2', value: 'value2' }
      ]
    });
  });
});
