import { Interpreter } from '../../src/interpreter/Interpreter';
import { Lexer } from '../../src/lexer/Lexer';
import { Parser } from '../../src/parser/Parser';

describe('Interpreter', () => {
  let interpreter: Interpreter;
  let parser: Parser;

  beforeEach(() => {
    interpreter = new Interpreter();
    parser = new Parser();
  });

  test('toJSON should return correct JSON', () => {
    const input = 'name: John Doe\nage: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parsed = parser.parse(tokens);
    interpreter.setData(parsed);

    const result = interpreter.toJSON();
    const expected = JSON.stringify({
      name: 'John Doe',
      age: 30
    }, null, 2);

    expect(result).toEqual(expected);
  });

  test('toYAML should return correct YAML', () => {
    const input = 'name: John Doe\nage: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parsed = parser.parse(tokens);
    interpreter.setData(parsed);

    const result = interpreter.toYAML();
    const expected = 'name: John Doe\nage: 30\n';

    expect(result).toEqual(expected);
  });

  test('toXML should return correct XML', () => {
    const input = 'person:\n  name: John Doe\n  age: 30';
    console.log('Input:', input);
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    console.log('Tokens:', JSON.stringify(tokens, null, 2));
    const parsed = parser.parse(tokens);
    console.log('Parsed:', JSON.stringify(parsed, null, 2));
    interpreter.setData(parsed);

    const result = interpreter.toXML();
    console.log('XML Result:', result);
    const expected = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <person>\n    <name>John Doe</name>\n    <age>30</age>\n  </person>\n</root>';

    expect(result).toEqual(expected);
  });

  test('export should return correct format based on input', () => {
    const input = 'name: John Doe\nage: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parsed = parser.parse(tokens);
    interpreter.setData(parsed);

    const jsonResult = interpreter.export('json');
    const yamlResult = interpreter.export('yaml');
    const xmlResult = interpreter.export('xml');

    expect(jsonResult).toEqual(JSON.stringify({ name: 'John Doe', age: 30 }, null, 2));
    expect(yamlResult).toEqual('name: John Doe\nage: 30\n');
    expect(xmlResult).toEqual('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <name>John Doe</name>\n  <age>30</age>\n</root>');
  });

  test('export should throw error for unsupported format', () => {
    const input = 'name: John Doe\nage: 30';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parsed = parser.parse(tokens);
    interpreter.setData(parsed);

    expect(() => interpreter.export('csv')).toThrow('Unsupported format: csv');
  });

});
