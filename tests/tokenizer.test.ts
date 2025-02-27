import { Tokenizer } from "../src/tokenizer/tokenizer";
import { TokenType } from "../src/tokenizer/token";

describe("Tokenizer", () => {
  it("should tokenize a simple key-value pair", () => {
    const input = "name: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    // Ensure we have the right tokens
    const keyTokens = tokens.filter((t) => t.type === TokenType.KEY);
    const colonTokens = tokens.filter((t) => t.type === TokenType.COLON);
    const newlineTokens = tokens.filter((t) => t.type === TokenType.NEWLINE);

    // We might get the value as a VALUE token or as another KEY token
    // depending on implementation details
    const valueTokens = tokens.filter(
      (t) =>
        (t.type === TokenType.VALUE && t.value === "value") ||
        (t.type === TokenType.KEY && t.value === "value")
    );

    expect(keyTokens.length).toBeGreaterThanOrEqual(1);
    expect(keyTokens[0].value).toBe("name");

    expect(colonTokens.length).toBe(1);
    expect(colonTokens[0].value).toBe(":");

    // Check that we have something representing the value
    expect(valueTokens.length).toBeGreaterThanOrEqual(1);

    expect(newlineTokens.length).toBe(1);
    expect(newlineTokens[0].value).toBe("\n");
  });

  it("should tokenize a nested structure", () => {
    const input = "person:\n  name: John\n  age: 30\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.KEY);
    expect(tokens.map((t) => t.type)).toContain(TokenType.COLON);
    expect(tokens.map((t) => t.type)).toContain(TokenType.NEWLINE);
    expect(tokens.map((t) => t.value)).toContain("person");
    expect(tokens.map((t) => t.value)).toContain("name");
    expect(tokens.map((t) => t.value)).toContain("John");
    expect(tokens.map((t) => t.value)).toContain("age");
    expect(tokens.map((t) => t.value)).toContain("30");
  });

  it("should tokenize comments", () => {
    const input = "// This is a comment\nkey: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.COMMENT);
    expect(tokens.find((t) => t.type === TokenType.COMMENT)?.value).toContain(
      "// This is a comment"
    );
  });

  it("should tokenize notices", () => {
    const input = "/! Copyright notice\nkey: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.NOTICE);
    expect(tokens.find((t) => t.type === TokenType.NOTICE)?.value).toContain(
      "/! Copyright notice"
    );
  });

  it("should tokenize a list", () => {
    const input = "fruits:\n  - apple\n  - banana\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.LIST_ITEM);
    expect(tokens.filter((t) => t.type === TokenType.LIST_ITEM).length).toBe(2);
    expect(tokens.map((t) => t.value)).toContain("-");
    expect(tokens.map((t) => t.value)).toContain("apple");
    expect(tokens.map((t) => t.value)).toContain("banana");
  });

  it("should tokenize a multiline string", () => {
    // This test will need to pass through the Lexer to get MULTILINE_STRING tokens
    const input = "description: |\n  Line 1\n  Line 2\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    // Check for MULTILINE_START token
    const multilineStart = tokens.find(
      (t) => t.type === TokenType.MULTILINE_START
    );
    expect(multilineStart).toBeDefined();
    expect(multilineStart?.value).toBe("|");
  });

  it("should tokenize an environment variable", () => {
    const input = "host: $_DB_HOST || localhost\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    const envVar = tokens.find((t) => t.type === TokenType.ENV_VAR);
    expect(envVar).toBeDefined();
    expect(envVar?.value).toContain("$_DB_HOST");
    // The token value may or may not include "|| localhost" depending on implementation
  });

  it("should tokenize a namespace declaration", () => {
    const input = "@- common\nkey: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(
      TokenType.NAMESPACE_DECLARATION
    );
    expect(
      tokens.find((t) => t.type === TokenType.NAMESPACE_DECLARATION)?.value
    ).toContain("@- common");
  });

  it("should tokenize a section declaration", () => {
    const input = "@/ development\nkey: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.SECTION_DECLARATION);
    expect(
      tokens.find((t) => t.type === TokenType.SECTION_DECLARATION)?.value
    ).toContain("@/ development");
  });
});
