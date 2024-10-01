import { Lexer } from './lexer/Lexer';
import { Parser } from './parser/Parser';

const input = `
key1: value1
key2: value2
  nested_key1: nested_value1
  nested_key2: nested_value2
key3: value3
`;

const lexer = new Lexer(input);
const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));
