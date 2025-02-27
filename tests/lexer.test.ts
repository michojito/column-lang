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

    // Find all INDENT and DEDENT tokens
    const indentTokens = tokens.filter((t) => t.type === TokenType.INDENT);
    const dedentTokens = tokens.filter((t) => t.type === TokenType.DEDENT);

    // We should have 2 INDENT tokens (one for nested level, one for deeply nested)
    expect(indentTokens.length).toBe(2);

    // We should have 2 DEDENT tokens (matching the INDENTs)
    expect(dedentTokens.length).toBe(2);

    // Check the sequence of indentation
    let indentLevel = 0;
    const indentSequence: string[] = [];

    tokens.forEach((token) => {
      if (token.type === TokenType.INDENT) {
        indentLevel++;
        indentSequence.push("INDENT");
      } else if (token.type === TokenType.DEDENT) {
        indentLevel--;
        indentSequence.push("DEDENT");
      } else if (token.type === TokenType.KEY) {
        indentSequence.push(`KEY(${indentLevel}): ${token.value}`);
      }
    });

    // Verify the indentation sequence
    expect(indentSequence).toContain("KEY(0): key1");
    expect(indentSequence).toContain("KEY(0): key2");
    expect(indentSequence).toContain("INDENT");
    expect(indentSequence).toContain("KEY(1): nested1");
    expect(indentSequence).toContain("KEY(1): nested2");
    expect(indentSequence).toContain("INDENT");
    expect(indentSequence).toContain("KEY(2): deeply_nested");
    expect(indentSequence).toContain("DEDENT");
    expect(indentSequence).toContain("KEY(1): nested3");
    expect(indentSequence).toContain("DEDENT");
    expect(indentSequence).toContain("KEY(0): key3");

    // Ensure indentation level is back to 0 at the end
    expect(indentLevel).toBe(0);
  });

  it("should handle multiline strings correctly", () => {
    const input = `description: |
  This is a multiline
  description that preserves
  line breaks.
key: value`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Check for multiline tokens
    const multilineStart = tokens.find(
      (t) => t.type === TokenType.MULTILINE_START
    );
    const multilineStrings = tokens.filter(
      (t) => t.type === TokenType.MULTILINE_STRING
    );
    const multilineEnd = tokens.find((t) => t.type === TokenType.MULTILINE_END);

    expect(multilineStart).toBeDefined();
    expect(multilineStart?.value).toBe("|");

    expect(multilineStrings.length).toBe(3); // 3 lines
    expect(multilineStrings[0].value.trim()).toBe("This is a multiline");
    expect(multilineStrings[1].value.trim()).toBe("description that preserves");
    expect(multilineStrings[2].value.trim()).toBe("line breaks.");

    expect(multilineEnd).toBeDefined();

    // Ensure the following content is still tokenized correctly
    const keyToken = tokens.find(
      (t) => t.type === TokenType.KEY && t.value === "key"
    );
    expect(keyToken).toBeDefined();
  });

  it("should handle comments correctly", () => {
    const input = `// This is a comment
key: value // This is an inline comment
/=> TODO: Implement this feature
/! Copyright notice`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Find comment tokens
    const regularComment = tokens.find((t) => t.type === TokenType.COMMENT);
    const inlineComment = tokens.find(
      (t) => t.type === TokenType.COMMENT && t.value.includes("inline")
    );
    const todoComment = tokens.find((t) => t.type === TokenType.TODO_COMMENT);
    const noticeComment = tokens.find((t) => t.type === TokenType.NOTICE);

    expect(regularComment).toBeDefined();
    expect(regularComment?.value).toContain("This is a comment");

    expect(inlineComment).toBeDefined();
    expect(inlineComment?.value).toContain("inline comment");

    expect(todoComment).toBeDefined();
    expect(todoComment?.value).toContain("TODO");

    expect(noticeComment).toBeDefined();
    expect(noticeComment?.value).toContain("Copyright");
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

    // Find list tokens
    const listItems = tokens.filter((t) => t.type === TokenType.LIST_ITEM);
    const values = tokens.filter((t) => t.type === TokenType.VALUE);

    expect(listItems.length).toBe(5); // 5 list items

    // Check the values are correctly paired with list items
    expect(values.length).toBeGreaterThanOrEqual(5);
    expect(values.find((v) => v.value === "apple")).toBeDefined();
    expect(values.find((v) => v.value === "banana")).toBeDefined();
    expect(values.find((v) => v.value === "orange")).toBeDefined();
    expect(values.find((v) => v.value === "mandarin")).toBeDefined();
    expect(values.find((v) => v.value === "clementine")).toBeDefined();
    expect(values.find((v) => v.value === "grape")).toBeDefined();

    // Check indentation is handled correctly for nested lists
    const indentTokens = tokens.filter((t) => t.type === TokenType.INDENT);
    const dedentTokens = tokens.filter((t) => t.type === TokenType.DEDENT);

    expect(indentTokens.length).toBe(2); // One for the main list, one for the nested list
    expect(dedentTokens.length).toBe(2); // Matching DEDENTs
  });

  it("should handle special declarations correctly", () => {
    const input = `@- common
shared_key: shared_value

@/ development
env: development`;

    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    // Find declaration tokens
    const namespace = tokens.find(
      (t) => t.type === TokenType.NAMESPACE_DECLARATION
    );
    const section = tokens.find(
      (t) => t.type === TokenType.SECTION_DECLARATION
    );

    expect(namespace).toBeDefined();
    expect(namespace?.value).toContain("common");

    expect(section).toBeDefined();
    expect(section?.value).toContain("development");
  });
});
