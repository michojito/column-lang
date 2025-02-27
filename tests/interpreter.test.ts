import { Interpreter } from "../src/interpreter/interpreter";
import { Parser } from "../src/parser/parser";
import { Lexer } from "../src/lexer/Lexer";
import { DocumentNode } from "../src/parser/ast";

describe("Interpreter", () => {
  function interpretContent(content: string, options = {}): any {
    const lexer = new Lexer(content);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter(options);
    return interpreter.interpret(ast);
  }

  it("should interpret basic key-value pairs", () => {
    const content = `
name: "My Project"
version: 1.0
is_active: true
nested:
  field1: value1
  field2: value2
`;

    const result = interpretContent(content);

    expect(result.data).toEqual({
      name: "My Project",
      version: 1.0,
      is_active: true,
      nested: {
        field1: "value1",
        field2: "value2",
      },
    });
  });

  it("should interpret lists", () => {
    const content = `
fruits:
  - apple
  - banana
  - orange
`;

    const result = interpretContent(content);

    expect(result.data).toEqual({
      fruits: ["apple", "banana", "orange"],
    });
  });

  it("should interpret complex nested structures", () => {
    const content = `
project:
  name: "Complex Example"
  settings:
    debug: true
    timeout: 30
    database:
      host: localhost
      port: 5432
  dependencies:
    - name: typescript
      version: ^5.0.0
    - name: jest
      version: ^29.0.0
`;

    const result = interpretContent(content);

    expect(result.data).toEqual({
      project: {
        name: "Complex Example",
        settings: {
          debug: true,
          timeout: 30,
          database: {
            host: "localhost",
            port: 5432,
          },
        },
        dependencies: [
          { name: "typescript", version: "^5.0.0" },
          { name: "jest", version: "^29.0.0" },
        ],
      },
    });
  });

  it("should interpret multiline strings correctly", () => {
    const content = `
preserve: |
  Line 1
  Line 2
  Line 3

fold: <
  These lines 
  should be 
  folded into one.

preserve_indent: |+
  Line 1
    Indented line
      More indentation
`;

    const result = interpretContent(content);

    // Preserved newlines
    expect(result.data.preserve).toBe("Line 1\nLine 2\nLine 3");

    // Folded newlines
    expect(result.data.fold).toBe("These lines should be folded into one.");

    // Preserved with indentation
    expect(result.data.preserve_indent).toContain("Line 1");
    expect(result.data.preserve_indent).toContain("  Indented line");
    expect(result.data.preserve_indent).toContain("    More indentation");
  });

  it("should interpret environment variables", () => {
    const content = `
host: $_HOST || localhost
port: $_PORT || 3000
api_key: $_API_KEY || default_key
`;

    // Test with environment variables defined
    const resultWithEnv = interpretContent(content, {
      env: {
        HOST: "example.com",
        PORT: "8080",
        API_KEY: "secret123",
      },
    });

    expect(resultWithEnv.data).toEqual({
      host: "example.com",
      port: "8080",
      api_key: "secret123",
    });

    // Test with fallback to default values
    const resultWithDefaults = interpretContent(content, {
      env: {},
    });

    expect(resultWithDefaults.data).toEqual({
      host: "localhost",
      port: "3000",
      api_key: "default_key",
    });
  });

  it("should include metadata when requested", () => {
    const content = `
/! Copyright 2023 Example Corp.
/! License: MIT

@- common

// Configuration file
key1: value1
key2: value2

/=> TODO: Add more settings
/=> TODO: Implement validation
`;

    const result = interpretContent(content, { includeMeta: true });

    // Check data
    expect(result.data).toEqual({
      key1: "value1",
      key2: "value2",
    });

    // Check metadata
    expect(result.meta).toBeDefined();
    expect(result.meta!.notices).toHaveLength(2);
    expect(result.meta!.notices[0]).toContain("Copyright");
    expect(result.meta!.notices[1]).toContain("License");

    expect(result.meta!.namespace).toBe("common");

    expect(result.meta!.todos).toHaveLength(2);
    expect(result.meta!.todos[0]).toContain("Add more settings");
    expect(result.meta!.todos[1]).toContain("Implement validation");
  });

  it("should interpret sections correctly", () => {
    const content = `
@/ development
env: development
debug: true

@/ production
env: production
debug: false
`;

    const result = interpretContent(content);

    expect(result.data).toEqual({
      development: {
        env: "development",
        debug: true,
      },
      production: {
        env: "production",
        debug: false,
      },
    });
  });

  it("should handle raw content", () => {
    const content = `
regex: \`\\d+\\.\\d+\`
multiline_raw: \`
  This is raw content
    that preserves all characters
  and special characters.
\`
`;

    const result = interpretContent(content);

    expect(result.data.regex).toBe("\\d+\\.\\d+");
    expect(result.data.multiline_raw).toContain("This is raw content");
    expect(result.data.multiline_raw).toContain(
      "  that preserves all characters"
    );
    expect(result.data.multiline_raw).toContain("and special characters.");
  });
});
