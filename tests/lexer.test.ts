import { Lexer } from "../src/lexer/Lexer";
import { TokenType } from "../src/tokenizer/token";

describe("Lexer", () => {
  it("should correctly process indentation", () => {
    const input = `key1: value1
key2:
  nested1: nestedValue1
  nested2: nestedValue2
    deeply_nested: deepValue
  nested3: nestedValue3
key3: value3`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Count keys to ensure we have the right number
    const keys = tokens.filter((t) => t.type === TokenType.KEY);
    expect(keys.length).toBe(7); // key1, key2, nested1, nested2, deeply_nested, nested3, key3

    // Check for appropriate indentation tokens
    const indents = tokens.filter((t) => t.type === TokenType.INDENT);
    const dedents = tokens.filter((t) => t.type === TokenType.DEDENT);

    // We should have at least some indentation tokens
    expect(indents.length).toBeGreaterThan(0);
    expect(dedents.length).toBeGreaterThan(0);

    // Indentation balance should be zero (every indent has a matching dedent)
    expect(indents.length).toBe(dedents.length);
  });

  it("should handle multiline strings correctly", () => {
    const input = `description: |
  This is a multiline
  description that preserves
  line breaks.
key: value`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Check that we have a MULTILINE_START token
    const multilineStartTokens = tokens.filter(
      (t) => t.type === TokenType.MULTILINE_START
    );
    expect(multilineStartTokens.length).toBe(1);
    expect(multilineStartTokens[0].value).toBe("|");

    // Verify we can parse tokens beyond the multiline content
    const keyTokens = tokens.filter(
      (t) => t.type === TokenType.KEY && t.value === "key"
    );
    expect(keyTokens.length).toBe(1);
  });

  it("should handle lists correctly", () => {
    const input = `fruits:
  - apple
  - banana
  - orange
    - mandarin
    - clementine
  - grape`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Find list item tokens
    const listItemTokens = tokens.filter((t) => t.type === TokenType.LIST_ITEM);

    // We should have 6 list items
    expect(listItemTokens.length).toBe(6);

    // Check indentation is present
    const indentTokens = tokens.filter((t) => t.type === TokenType.INDENT);
    const dedentTokens = tokens.filter((t) => t.type === TokenType.DEDENT);

    expect(indentTokens.length).toBeGreaterThan(0);
    expect(dedentTokens.length).toBeGreaterThan(0);
  });

  it("should handle comments correctly", () => {
    const input = `// This is a comment
key: value // This is an inline comment
/=> TODO: Implement this feature
/! Copyright notice`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Find comment tokens
    const regularComments = tokens.filter((t) => t.type === TokenType.COMMENT);
    const todoComments = tokens.filter(
      (t) => t.type === TokenType.TODO_COMMENT
    );
    const noticeComments = tokens.filter((t) => t.type === TokenType.NOTICE);

    expect(regularComments.length).toBeGreaterThanOrEqual(1);
    expect(todoComments.length).toBe(1);
    expect(noticeComments.length).toBe(1);
  });

  it("should handle special declarations correctly", () => {
    const input = `@- common
shared_key: shared_value

@/ development
env: development`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Find declaration tokens
    const namespaceDeclarations = tokens.filter(
      (t) => t.type === TokenType.NAMESPACE_DECLARATION
    );
    const sectionDeclarations = tokens.filter(
      (t) => t.type === TokenType.SECTION_DECLARATION
    );

    expect(namespaceDeclarations.length).toBe(1);
    expect(sectionDeclarations.length).toBe(1);
  });
});
