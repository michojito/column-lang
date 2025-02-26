import { Tokenizer } from "../src/tokenizer/tokenizer";
import { TokenType } from "../src/tokenizer/token";

describe("Tokenizer", () => {
  it("should tokenize a simple key-value pair", () => {
    const input = "name: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      expect.objectContaining({ type: TokenType.KEY, value: "name" }),
      expect.objectContaining({ type: TokenType.COLON, value: ":" }),
      expect.objectContaining({ type: TokenType.VALUE, value: "value" }),
      expect.objectContaining({ type: TokenType.NEWLINE, value: "\n" }),
      expect.objectContaining({ type: TokenType.EOF, value: "" }),
    ]);
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
    expect(tokens.map((t) => t.value)).toContain("apple");
    expect(tokens.map((t) => t.value)).toContain("banana");
  });

  it("should tokenize a multiline string", () => {
    const input = "description: |\n  Line 1\n  Line 2\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.MULTILINE_START);
    expect(
      tokens.find((t) => t.type === TokenType.MULTILINE_START)?.value
    ).toBe("|");
    expect(tokens.map((t) => t.type)).toContain(TokenType.MULTILINE_STRING);
  });

  it("should tokenize an environment variable", () => {
    const input = "host: $_DB_HOST || localhost\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens.map((t) => t.type)).toContain(TokenType.ENV_VAR);
    expect(tokens.find((t) => t.type === TokenType.ENV_VAR)?.value).toContain(
      "$_DB_HOST || localhost"
    );
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
