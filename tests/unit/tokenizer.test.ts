import { Tokenizer } from "../../src/tokenizer/tokenizer";
import { TokenType } from "../../src/tokenizer/token";

describe("Tokenizer", () => {
  it("should tokenize a simple key-value pair", () => {
    const input = "name: value\n";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      expect.objectContaining({ type: TokenType.KEY, value: "name" }),
      expect.objectContaining({ type: TokenType.COLON, value: ":" }),
      expect.objectContaining({ type: TokenType.KEY, value: "value" }),
      expect.objectContaining({ type: TokenType.NEWLINE, value: "\n" }),
      expect.objectContaining({ type: TokenType.EOF, value: "" }),
    ]);
  });

  it("should track line and column numbers correctly", () => {
    const input = "key1: value1\nkey2: value2";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    console.log(
      "Tokens:",
      tokens.map((t) => ({
        type: t.type,
        value: t.value,
        position: t.position,
      }))
    );

    expect(tokens[0].position).toEqual({ line: 1, column: 1, index: 0 });
    expect(tokens[5].position).toEqual({ line: 2, column: 5, index: 16 });
  });
});
